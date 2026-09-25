export const
	APP_DOMAIN 			= 'raindrop.io'

export const
	APP_BASE_URL 		= `https://${APP_DOMAIN}`,
	WORKERS_BASE_URL	= 'https://rdl.ink',
	LEGACY_WORKERS_BASE_URL=`https://stella.${APP_DOMAIN}`

export const
	RECAPTCHA_SITE_KEY = '6LfB38wUAAAAAMX3VuFcriTz-Tb-qw7MD966XNnk'

export const
	// CONNECT_LOCAL serves this website on this Mac and proxies /v1 to Raindrop.
	// The browser cannot call api.raindrop.io directly from 127.0.0.1.
	API_ENDPOINT_URL 	= `${process.env.CONNECT_LOCAL == '1' ? '' : (process.env.NODE_ENV == 'production' || RAINDROP_ENVIRONMENT == 'react-native' ? 'https://api.raindrop.io' : 'http://localhost:3000')}/v1/`,
	API_RETRIES 		= 3,
	API_TIMEOUT 		= 30000,
	FAVICON_URL 		= `${WORKERS_BASE_URL}/favicon`,
	RENDER_URL 			= `${WORKERS_BASE_URL}/render`,
	PREVIEW_URL			= 'https://preview.systems',
	BETA_AI_URL			= process.env.NODE_ENV == 'production' ? 'https://beta-ai.raindrop.io/ai' : 'http://localhost:5173/ai'