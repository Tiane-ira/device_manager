package main

import (
	"device_ma/models"
	"device_ma/routes"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func main() {
	os.MkdirAll("data", 0755)
	db, err := gorm.Open(sqlite.Open("data/device_reservation.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	db.AutoMigrate(&models.Device{}, &models.Reservation{}, &models.User{}, &models.TimeSlot{})

	r := gin.Default()

	// Register routes
	routes.DeviceRoutes(r, db)
	routes.ReservationRoutes(r, db)
	routes.UserRoutes(r, db)
	routes.TimeSlotRoutes(r, db)

	r.Run(":8080")
}
