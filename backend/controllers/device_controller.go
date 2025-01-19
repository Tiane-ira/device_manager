package controllers

import (
	"device_ma/models"
	"device_ma/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetDevices(c *gin.Context, db *gorm.DB) {
	var devices []models.Device
	db.Find(&devices)
	utils.Success(c, devices)
}

func CreateDevice(c *gin.Context, db *gorm.DB) {
	var device models.Device
	if err := c.ShouldBindJSON(&device); err != nil {
		utils.Error(c, err.Error())
		return
	}
	db.Create(&device)
	utils.Success(c, device)
}

func UpdateDevice(c *gin.Context, db *gorm.DB) {
	var device models.Device
	if err := db.First(&device, c.Param("id")).Error; err != nil {
		utils.Error(c, "Device not found")
		return
	}
	if err := c.ShouldBindJSON(&device); err != nil {
		utils.Error(c, err.Error())
		return
	}
	db.Save(&device)
	utils.Success(c, device)
}

func DeleteDevice(c *gin.Context, db *gorm.DB) {
	if err := db.Delete(&models.Device{}, c.Param("id")).Error; err != nil {
		utils.Error(c, "Device not found")
		return
	}
	utils.Success(c, nil)
}
