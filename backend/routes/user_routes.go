package routes

import (
	"device_ma/controllers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserRoutes(r *gin.Engine, db *gorm.DB) {
	r.POST("/login", func(c *gin.Context) { controllers.Login(c, db) })
	r.POST("/register", func(c *gin.Context) { controllers.Register(c, db) })
}
