package main

import (
	"os"

	"github.com/cmwylie19/kubescrub/pkg/utils"
	"go.uber.org/zap"
)

func main() {
	if err := GetRootCommand().Execute(); err != nil {
		utils.Logger.Error("Error executing command", zap.Error(err))
		os.Exit(1)
	}
}

func init() {
	utils.InitLogger()
}
