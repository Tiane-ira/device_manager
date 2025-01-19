package models

import (
	"time"
)

type Device struct {
	ID          uint `gorm:"primarykey"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Name        string `json:"name"`
	IP          string `json:"ip"`
	Description string `json:"description"`
	Status      string `json:"status"`
}
