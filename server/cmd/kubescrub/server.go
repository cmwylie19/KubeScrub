package main

import (
	"github.com/cmwylie19/kubescrub/pkg/server"
	"github.com/spf13/cobra"
)

var (
	port         string
	key          string
	cert         string
	watch        []string
	poll         bool
	readOnly     bool
	pollInterval int
	namespaced   bool
	namespaces   []string
	theme        string
	password     string
)

func getServerCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "serve",
		Aliases: []string{"s"},
		Short:   "Start the KubeScrub server",
		RunE: func(cmd *cobra.Command, args []string) error {
			s := &server.Server{}
			s.Start()
			return s.Serve(key, cert, port, watch, poll, readOnly, pollInterval, namespaced, namespaces, theme, password)
		},
	}

	cmd.PersistentFlags().StringVarP(&port, "port", "p", "8080", "The port to run the server on")
	cmd.PersistentFlags().StringVarP(&key, "key", "", "", "Server private key for TLS encryption.")
	cmd.PersistentFlags().StringVarP(&cert, "cert", "", "", "Server certificate for TLS encryption")
	cmd.PersistentFlags().BoolVarP(&poll, "poll", "", false, "Poll for changes instead of watching for changes")
	cmd.PersistentFlags().IntVarP(&pollInterval, "poll-interval", "", 60, "Polling interval in seconds")
	cmd.PersistentFlags().BoolVarP(&readOnly, "read-only", "", false, "Run in read-only mode")
	cmd.PersistentFlags().BoolVarP(&namespaced, "namespaced", "", false, "Run in namespaced mode")
	cmd.PersistentFlags().StringSliceVarP(&namespaces, "namespaces", "", []string{}, "Namespaces to watch")
	cmd.PersistentFlags().StringVarP(&theme, "theme", "", "dark", "Theme to use for the UI")
	cmd.PersistentFlags().StringVarP(&password, "password", "", "cluster-admin", "Password to use for the UI")

	cmd.PersistentFlags().StringSliceVar(&watch, "watch", []string{"cm", "sa", "svc", "secret"}, "Types of resources to watch")

	return cmd
}
