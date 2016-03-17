'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/recevaltool',
	port: 8080,
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-cookies/angular-cookies.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-touch/angular-touch.min.js',
				'public/lib/angular-sanitize/angular-sanitize.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/angular-translate/angular-translate.min.js',
				'public/lib/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
				'public/lib/angular-translate-storage-local/angular-translate-storage-local.min.js',
				'public/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
