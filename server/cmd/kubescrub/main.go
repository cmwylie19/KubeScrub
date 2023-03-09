package main

import "os"

func main() {
	if err := GetRootCmd().Execute(); err != nil {
		utils.Logger.Error("Error executing command", zap.Error(err))
		os.Exit(1)
	}
}
