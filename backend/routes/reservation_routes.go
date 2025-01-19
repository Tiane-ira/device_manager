package routes

import (
	"device_ma/controllers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ReservationRoutes(r *gin.Engine, db *gorm.DB) {
	r.GET("/reservations", func(c *gin.Context) { controllers.GetReservations(c, db) })
	r.POST("/reservations", func(c *gin.Context) { controllers.CreateReservation(c, db) })
	r.DELETE("/reservations/:id", func(c *gin.Context) { controllers.DeleteReservation(c, db) })
} 