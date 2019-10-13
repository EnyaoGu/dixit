module.exports = {
	/**
	 * Application configuration section
	 * http://pm2.keymetrics.io/docs/usage/application-declaration/
	 */
	apps: [
		{
			name: 'game-server',
			script: './server/index.js',
			node_args: ['--max-old-space-size=1024'], // 1 gb limit
			env: {
				NODE_ENV: 'production',
			},
			out_file: './logs/game-server.log',
			error_file: './logs/game-server.log',
		},
		{
			name: 'page-server',
			script: './node_modules/http-server/bin/http-server',
			args: './dist/ -p 2048',
			node_args: ['--max-old-space-size=1024'], // 1 gb limit
			env: {
				NODE_ENV: 'production',
			},
			out_file: './logs/page-server.log',
			error_file: './logs/page-server.log',
		},
	],
};
