module.exports = {
	/**
	 * Application configuration section
	 * http://pm2.keymetrics.io/docs/usage/application-declaration/
	 */
	apps: [
		{
			name: 'dixit-server',
			script: './server/index.js',
			node_args: ['--max-old-space-size=1024'], // 1 gb limit
			env: {
				NODE_ENV: 'production',
			},
			out_file: './logs/game-server.log',
			error_file: './logs/game-server.log',
		},
	],
};
