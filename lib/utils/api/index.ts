import axios from 'axios'
const baseURL =
	process.env.NEXT_PUBLIC_URL 

const api = axios.create({
	baseURL: `${baseURL}`,
})

api.interceptors.request.use(
	(config) => {
		// TODO: Add token to the request
		// const jwt = store.getState().auth.token
		// if (jwt) {
		// 	config.headers.Authorization = `Bearer ${jwt}`
		// }

		return config
	},
	(error) => {
		return Promise.reject(error)
	},
)

// Add an interceptor to handle response errors
api.interceptors.response.use(
	(response) => {
		return response
	},
	(error) => {
		if (error.response) {
			const { status, data } = error.response
			if (
				status === 401 &&
				data.message === 'An error occurred - Token Expired'
			) {
				// Token has expired, redirect to the login page
				window.location.href = '/auth/login'
			}
		}
		return Promise.reject(error)
	},
)

export default api
