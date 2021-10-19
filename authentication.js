const testAuth = async (z, bundle) => {
	const baseUrl =
		bundle.authData.env === "production" ? "netopcld.net" : "net-bot.com";

	const accessOptions = {
		url: `https://${baseUrl}/1.0/globalInfo/access`,
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${bundle.authData.id_token}`,
		},
		params: {},
	};

	const accessResponse = await z.request(accessOptions);

	accessResponse.throwForStatus();

	const accessResults = accessResponse.json;

	let resourceEndpoint;

	if (accessResults.roleType === "Organization") {
		resourceEndpoint = "organizations";
	} else if (accessResults.roleType === "Tenant") {
		resourceEndpoint = "tenants";
	} else {
		throw new Error(
			`Unrecognized access role type "${accessResults.roleType}`
		);
	}

	// You can do any parsing you need for results here before returning them
	const resourceOptions = {
		url: `https://${baseUrl}/1.0/${resourceEndpoint}/${accessResults.resourceId}`,
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${bundle.authData.id_token}`,
		},
		params: {},
	};

	const resourceResponse = await z.request(resourceOptions);

	resourceResponse.throwForStatus();
	const resourceResults = resourceResponse.json;

	return resourceResults;
};

module.exports = {
	type: "oauth2",
	test: testAuth,
	oauth2Config: {
		authorizeUrl: {
			method: "GET",
			url: "https://netop.auth0.com/authorize",
			params: {
				client_id: "{{process.env.CLIENT_ID}}",
				state: "{{bundle.inputData.state}}",
				redirect_uri: "{{bundle.inputData.redirect_uri}}",
				response_type: "code",
			},
		},
		getAccessToken: async (z, bundle) => {
			const options = {
				url: "https://netop.auth0.com/oauth/token",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				params: {
				},
				body: {
					"code": bundle.inputData.code,
					"redirect_uri": bundle.inputData.redirect_uri,
					"client_id": process.env.CLIENT_ID,
					"client_secret": process.env.CLIENT_SECRET,
					"grant_type": "authorization_code"
				}
			}

			const response = await z.request(options);

			response.throwForStatus();

			const results = response.json;

			// You can do any parsing you need for results here before returning them
			return results;
		},
		refreshAccessToken: async (z, bundle) => {
			const options = {
				url: "https://netop.auth0.com/oauth/token",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				params: {

				},
				body: {
					"code": bundle.inputData.refresh_token,
					"redirect_uri": bundle.inputData.redirect_uri,
					"client_id": process.env.CLIENT_ID,
					"client_secret": process.env.CLIENT_SECRET,
					"grant_type": "refresh_token"
				}
			}

			const response = await z.request(options);

			response.throwForStatus();

			const results = response.json;

			// You can do any parsing you need for results here before returning them

			return results;
		},
		scope: "openid profile email offline_access",
		autoRefresh: true,
	},
	fields: [
		{
			computed: false,
			key: "env",
			required: true,
			label: "Environment",
			type: "string",
			helpText: "Choose the NetOp environment you're connecting to.",
			choices: ["production", "staging"],
		},
	],
	connectionLabel: "{{bundle.inputData.name}} [{{bundle.authData.env}}]",
};
