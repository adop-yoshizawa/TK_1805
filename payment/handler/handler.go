package handler

import (
	"fmt"

	"github.com/KeisukeYamashita/TK_1805/payment/helpers"
	"github.com/KeisukeYamashita/TK_1805/payment/types"
	"github.com/kataras/golog"
	"github.com/kataras/iris"
	stripe "github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/charge"
)

// Controller ...
type Controller struct {
	DB types.Datastorable
}

// NewController ...
func NewController(db types.Datastorable) *Controller {
	return &Controller{
		DB: db,
	}
}

// ExecPayment ...
// There is several ways to create a payment, see
// https://stackoverflow.com/questions/34415987/stripe-payment-getting-error-as-customer-cus-does-not-have-a-linked-card
// for more details about token vs Source. And my logic came from this article.
// https://qiita.com/y_toku/items/7e51ef7e69d7cbbfb3ca
func (ctr *Controller) ExecPayment() func(ctx iris.Context) {
	return func(ctx iris.Context) {
		golog.Info("ExecPayment exec started")
		amountStr := ctx.FormValue("amount")
		customerID := ctx.FormValue("customerID")
		userID := ctx.FormValue("userID")
		description := ctx.FormValue("description")

		if amountStr == "" || userID == "" {
			golog.Warn(fmt.Sprintf("error while getting form value 'amount' and 'userID': amount: %v, userID: %v", amountStr, userID))
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{
				"error": iris.Map{
					"statusCode": iris.StatusBadRequest,
					"message":    "amount or userID is missing",
				},
			})
			return
		}

		user := new(types.User)
		amount, err := helpers.StrToInt64(amountStr)

		if err != nil {
			golog.Warn(fmt.Sprintf("cannot parse amount: error: %v, amount: %v", err.Error(), amountStr))
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{
				"error": iris.Map{
					"statusCode": iris.StatusBadRequest,
					"message":    err.Error(),
				},
			})
			return
		}

		if err := ctr.DB.Where("name = ?", userID).First(user); err != nil {
			golog.Error(fmt.Sprintf("error while finding customer with name field: err: %v, userID:%v", err.Error(), userID))
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(iris.Map{
				"error": iris.Map{
					"statusCode": iris.StatusInternalServerError,
					"message":    err.Error(),
				},
			})
			return
		}

		golog.Info("Finding user succeeded")

		chargeParams := &stripe.ChargeParams{
			Amount:      stripe.Int64(amount),
			Currency:    stripe.String(string(stripe.CurrencyJPY)),
			Description: stripe.String(description),
		}

		if customerID != "" {
			chargeParams.Customer = &customerID
		} else if user.StripeCustomerID != "" {
			chargeParams.Customer = &user.StripeCustomerID
		} else {
			golog.Info("Detect this is first payment...")
			email := ctx.FormValue("email")
			stripeToken := ctx.FormValue("stripeToken")

			if stripeToken == "" {
				golog.Warn(fmt.Sprintf("no form value 'stripeToken'"))
				ctx.StatusCode(iris.StatusBadRequest)
				ctx.JSON(iris.Map{
					"error": iris.Map{
						"statusCode": iris.StatusBadRequest,
						"message":    "email, stripeToken is missing",
					},
				})
				return
			}

			golog.Info("CreateCustomerWithEmailAndUserID trying...")

			cus, err := helpers.CreateCustomerWithEmailAndUserID(email, userID, stripeToken)

			if err != nil {
				golog.Error(fmt.Sprintf("error while creating customer: %v", err.Error()))
				ctx.StatusCode(iris.StatusBadRequest)
				ctx.JSON(iris.Map{
					"error": iris.Map{
						"statusCode": iris.StatusBadRequest,
						"message":    err.Error(),
					},
				})
				return
			}

			if err := ctr.DB.Where("name = ?", userID).First(user); err != nil {
				golog.Error(fmt.Sprintf("error while finding customer with name field: err: %v, userID:%v", err.Error(), userID))
				ctx.StatusCode(iris.StatusInternalServerError)
				ctx.JSON(iris.Map{
					"error": iris.Map{
						"statusCode": iris.StatusInternalServerError,
						"message":    err.Error(),
					},
				})
				return
			}

			golog.Info("Finding user succeeded")

			if err := ctr.DB.Model(user).Update("stripe_customer_id", cus.ID); err != nil {
				ctx.StatusCode(iris.StatusInternalServerError)
				ctx.JSON(iris.Map{
					"error": iris.Map{
						"statusCode": iris.StatusInternalServerError,
						"message":    err.Error(),
					},
				})
				return
			}

			golog.Info("Updating user succeeded")

			chargeParams.Customer = &cus.ID
		}

		ch, err := charge.New(chargeParams)

		if err != nil {
			golog.Error(fmt.Sprintf("error while charging customer: err: %v, customerID: %v", err.Error(), chargeParams.Customer))
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{
				"error": iris.Map{
					"statusCode": iris.StatusBadRequest,
					"message":    err.Error(),
				},
			})
			return
		}

		golog.Info("ExecPayment successfully finished")

		ctx.StatusCode(iris.StatusOK)
		ctx.JSON(iris.Map{
			"error": "",
			"message": iris.Map{
				"customerID":  ch.Customer.ID,
				"chargeID":    ch.ID,
				"amount":      ch.Amount,
				"currency":    ch.Currency,
				"description": ch.Description,
			},
		})
		return
	}
}
