package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	Server             ServerConfig   `mapstructure:"server"`
	Database           DatabaseConfig `mapstructure:"database"`
	Redis              RedisConfig    `mapstructure:"redis"`
	JWT                JWTConfig      `mapstructure:"jwt"`
	CompanyID          string         `mapstructure:"company_id"`
	AccessCode         string         `mapstructure:"access_code"`
	InvitationDuration string         `mapstructure:"invitation_duration"`
}

type ServerConfig struct {
	Port string `mapstructure:"port"`
}

type DatabaseConfig struct {
	URL string `mapstructure:"url"`
}

type RedisConfig struct {
	URL string `mapstructure:"url"`
}

type JWTConfig struct {
	Secret string `mapstructure:"secret"`
}

func Load() (*Config, error) {
	viper.AddConfigPath("configs")
	viper.AddConfigPath("../configs")
	viper.AddConfigPath("../../configs")
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")

	viper.AutomaticEnv()

	// Mapeia variáveis de ambiente de nível superior para a estrutura aninhada
	_ = viper.BindEnv("server.port", "PORT")
	_ = viper.BindEnv("database.url", "DATABASE_URL")
	_ = viper.BindEnv("redis.url", "REDIS_URL")
	_ = viper.BindEnv("jwt.secret", "JWT_SECRET")
	_ = viper.BindEnv("company_id", "COMPANY_ID")
	_ = viper.BindEnv("access_code", "REGISTRATION_ACCESS_CODE")
	_ = viper.BindEnv("invitation_duration", "INVITATION_DURATION")

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
		log.Println("Aviso: Arquivo de configuração config.yaml não encontrado. Usando variáveis de ambiente.")
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	// Fallback padrão se estiver vazio
	if cfg.Server.Port == "" {
		cfg.Server.Port = "8080"
	}
	if cfg.InvitationDuration == "" {
		cfg.InvitationDuration = "24h"
	}

	return &cfg, nil
}
