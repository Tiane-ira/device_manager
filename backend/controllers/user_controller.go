package controllers

import (
	"device_ma/models"
	"device_ma/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Login(c *gin.Context, db *gorm.DB) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		utils.Error(c, err.Error())
		return
	}
	var dbUser models.User
	if err := db.Where("username = ? AND password = ?", user.Username, user.Password).First(&dbUser).Error; err != nil {
		utils.Error(c, "用户名或密码错误")
		return
	}
	utils.Success(c, dbUser)
}

func Register(c *gin.Context, db *gorm.DB) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		utils.Error(c, err.Error())
		return
	}
	if err := db.Create(&user).Error; err != nil {
		utils.Error(c, err.Error())
		return
	}
	utils.Success(c, user)
}
