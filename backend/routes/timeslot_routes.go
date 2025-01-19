package routes

import (
	"device_ma/controllers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func TimeSlotRoutes(r *gin.Engine, db *gorm.DB) {
	r.GET("/time-slots", func(c *gin.Context) { controllers.GetTimeSlots(c, db) })
	r.POST("/time-slots", func(c *gin.Context) { controllers.CreateTimeSlot(c, db) })
	r.PUT("/time-slots/:id", func(c *gin.Context) { controllers.UpdateTimeSlot(c, db) })
	r.DELETE("/time-slots/:id", func(c *gin.Context) { controllers.DeleteTimeSlot(c, db) })
}
