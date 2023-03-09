package main

import "github.com/spf13/cobra"

var (
	port string
	key  string
	cert string
)

func getServerCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "serve",
		Aliases: []string{"s"},
		Short:   "Start the KubeScrub server",
		RunE: func(cmd *cobra.Command, args []string) error {
			s := &server.Server{}
			s.Serve(key, cert, port)
		},
	}
	return cmd
}
