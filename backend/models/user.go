package models

import "time"

type User struct {
	ID        uint `gorm:"primarykey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Username  string `gorm:"unique" json:"username"`
	Password  string `json:"password"`
	Name      string `json:"name"`
	Role      string `json:"role"`
}
