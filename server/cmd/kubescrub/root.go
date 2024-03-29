package main

import (
	"github.com/spf13/cobra"
)

var Verbose bool

var baseCmd = &cobra.Command{
	Use:   "kubescrub",
	Long:  `KubeScrub is a Kubernetes tool that helps you find and fix orphaned resources in your clusters.`,
	Short: `KubeScrub is a Kubernetes tool that helps you find and fix orphaned resources.`,
}

func GetRootCommand() *cobra.Command {
	baseCmd.PersistentFlags().BoolVarP(&Verbose, "verbose", "v", false, "verbose output")

	baseCmd.AddCommand(getServerCommand())
	return baseCmd
}
