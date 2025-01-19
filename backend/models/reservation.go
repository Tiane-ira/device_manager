package models

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type Reservation struct {
	ID           uint `gorm:"primarykey"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeviceID     uint   `json:"deviceID"`
	DeviceName   string `json:"deviceName"`
	Date         string `json:"date"`
	TimeSlotID   uint   `json:"timeSlotID"`
	TimeSlotName string `json:"timeSlotName"`
	TimeRange    string `json:"timeRange"`
	UserName     string `json:"userName"`
}

// CheckConflict 检查预约时间是否冲突
func (r *Reservation) CheckConflict(db *gorm.DB) error {
	var count int64
	// 检查同一设备在同一天同一时间段是否已被预约
	result := db.Model(&Reservation{}).
		Where("device_id = ? AND date = ? AND time_slot_id = ? AND id != ?",
			r.DeviceID, r.Date, r.TimeSlotID, r.ID).
		Count(&count)

	if result.Error != nil {
		return result.Error
	}

	if count > 0 {
		return errors.New("该时间段已被预约")
	}

	return nil
}

// ValidateReservation 验证预约信息
func (r *Reservation) ValidateReservation() error {
	if r.DeviceID == 0 {
		return errors.New("设备ID不能为空")
	}
	if r.Date == "" {
		return errors.New("预约日期不能为空")
	}
	if r.TimeSlotID == 0 {
		return errors.New("时间段不能为空")
	}
	if r.UserName == "" {
		return errors.New("用户名不能为空")
	}
	return nil
}
