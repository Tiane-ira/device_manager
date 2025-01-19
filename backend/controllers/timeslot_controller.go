package controllers

import (
	"device_ma/models"
	"device_ma/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetTimeSlots(c *gin.Context, db *gorm.DB) {
	var timeSlots []models.TimeSlot
	db.Find(&timeSlots)
	utils.Success(c, timeSlots)
}

func CreateTimeSlot(c *gin.Context, db *gorm.DB) {
	var timeSlot models.TimeSlot
	if err := c.ShouldBindJSON(&timeSlot); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&timeSlot)
	utils.Success(c, timeSlot)
}

func UpdateTimeSlot(c *gin.Context, db *gorm.DB) {
	var timeSlot models.TimeSlot
	if err := db.First(&timeSlot, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "TimeSlot not found"})
		return
	}
	if err := c.ShouldBindJSON(&timeSlot); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&timeSlot)
	utils.Success(c, timeSlot)
}

func DeleteTimeSlot(c *gin.Context, db *gorm.DB) {
	if err := db.Delete(&models.TimeSlot{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "TimeSlot not found"})
		return
	}
	utils.Success(c, struct{}{})
}
