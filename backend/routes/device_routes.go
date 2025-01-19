package routes

import (
	"device_ma/controllers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func DeviceRoutes(r *gin.Engine, db *gorm.DB) {
	r.GET("/devices", func(c *gin.Context) { controllers.GetDevices(c, db) })
	r.POST("/devices", func(c *gin.Context) { controllers.CreateDevice(c, db) })
	r.PUT("/devices/:ID", func(c *gin.Context) { controllers.UpdateDevice(c, db) })
	r.DELETE("/devices/:ID", func(c *gin.Context) { controllers.DeleteDevice(c, db) })
}
