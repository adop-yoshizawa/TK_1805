package main

import (
	"log"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"github.com/kataras/iris"

	"github.com/KeisukeYamashita/TK_1805/store/app"
	"github.com/KeisukeYamashita/TK_1805/store/helpers"
	"github.com/KeisukeYamashita/TK_1805/store/types"
)

var (
	db          *gorm.DB
	debugMode   bool
	paymentHost string
	paymentPort int
)

func init() {
	var err error

	db, err = gorm.Open("mysql", "root:@/jphack2018?charset=utf8&parseTime=True&loc=Local")

	if err != nil {
		log.Fatal(err)
	}

	debugMode = os.Getenv("GO_ENV") == "test"

	paymentHost, paymentPort, err = helpers.GetPaymentServerInfo(debugMode)

	if err != nil {
		log.Fatal(err)
	}

	db.LogMode(debugMode)
	db.AutoMigrate(&types.User{}, &types.Transaction{}, &types.Store{}, &types.Table{}, &types.Group{})
}

func main() {
	app := app.NewIrisApp(db, debugMode, paymentHost, paymentPort)
	app.Run(iris.Addr(":8880"))

	defer db.Close()
}
