package controllers

import (
	"device_ma/models"
	"device_ma/utils"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetReservations(c *gin.Context, db *gorm.DB) {
	deviceId := c.Query("deviceId")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")
	isExport := c.Query("isExport")
	if deviceId == "" && startDate == "" && endDate == "" {
		startDate = time.Now().Format("2006-01-02")
		endDate = time.Now().AddDate(0, 0, 1).Format("2006-01-02")
	}
	if isExport == "1" {
		startDate = ""
		endDate = ""
		deviceId = ""
	}
	var reservations []models.Reservation
	if deviceId != "" {
		db = db.Where("device_id = ?", deviceId)
	}
	if startDate != "" {
		db = db.Where("date >= ?", startDate)
	}
	if endDate != "" {
		db = db.Where("date <= ?", endDate)
	}
	db.Order("date ASC,device_id ASC").Find(&reservations)
	utils.Success(c, reservations)
}

func CreateReservation(c *gin.Context, db *gorm.DB) {
	var reservation models.Reservation
	if err := c.ShouldBindJSON(&reservation); err != nil {
		utils.Error(c, err.Error())
		return
	}
	if err := reservation.CheckConflict(db); err != nil {
		utils.Error(c, err.Error())
		return
	}
	if err := reservation.ValidateReservation(); err != nil {
		utils.Error(c, err.Error())
		return
	}
	db.Create(&reservation)
	utils.Success(c, reservation)
}

func DeleteReservation(c *gin.Context, db *gorm.DB) {
	if err := db.Delete(&models.Reservation{}, c.Param("id")).Error; err != nil {
		utils.Error(c, err.Error())
	}
	utils.Success(c, struct{}{})
}
