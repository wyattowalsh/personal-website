└── docs
    ├── README.md
    ├── docs
        ├── content
        │   ├── apis
        │   │   ├── apis.md
        │   │   ├── bounces.md
        │   │   ├── campaigns.md
        │   │   ├── import.md
        │   │   ├── lists.md
        │   │   ├── media.md
        │   │   ├── sdks.md
        │   │   ├── subscribers.md
        │   │   ├── templates.md
        │   │   └── transactional.md
        │   ├── archives.md
        │   ├── bounces.md
        │   ├── concepts.md
        │   ├── configuration.md
        │   ├── developer-setup.md
        │   ├── external-integration.md
        │   ├── i18n.md
        │   ├── images
        │   │   ├── 2021-09-28_00-18.png
        │   │   ├── archived-campaign-metadata.png
        │   │   ├── edit-subscriber.png
        │   │   ├── favicon.png
        │   │   ├── logo.svg
        │   │   ├── query-subscribers.png
        │   │   └── splash.png
        │   ├── index.md
        │   ├── installation.md
        │   ├── maintenance
        │   │   └── performance.md
        │   ├── messengers.md
        │   ├── querying-and-segmentation.md
        │   ├── static
        │   │   └── style.css
        │   ├── templating.md
        │   └── upgrade.md
        └── mkdocs.yml
    ├── i18n
        ├── index.html
        ├── main.js
        ├── style.css
        └── vue.min.js
    ├── site
        ├── .hugo_build.lock
        ├── config.toml
        ├── content
        │   └── .gitignore
        ├── data
        │   └── github.json
        ├── layouts
        │   ├── index.html
        │   ├── page
        │   │   └── single.html
        │   ├── partials
        │   │   ├── footer.html
        │   │   └── header.html
        │   └── shortcodes
        │   │   ├── centered.html
        │   │   ├── github.html
        │   │   ├── half.html
        │   │   └── section.html
        └── static
        │   └── static
        │       ├── base.css
        │       ├── images
        │           ├── 2022-07-31_19-07.png
        │           ├── 2022-07-31_19-08.png
        │           ├── analytics.png
        │           ├── favicon.png
        │           ├── listmonk.src.svg
        │           ├── lists.png
        │           ├── logo.png
        │           ├── logo.svg
        │           ├── media.png
        │           ├── messengers.png
        │           ├── performance.png
        │           ├── privacy.png
        │           ├── s1.png
        │           ├── s2.png
        │           ├── s2.svg
        │           ├── s3.png
        │           ├── s4.png
        │           ├── smtp.png
        │           ├── splash.png
        │           ├── templating.png
        │           ├── thumbnail.png
        │           └── tx.png
        │       └── style.css
    └── swagger
        └── collections.yaml


/docs/README.md:
--------------------------------------------------------------------------------
 1 | # Static website and docs
 2 | 
 3 | This repository contains the source for the static website https://listmonk.app
 4 | 
 5 | - The website is in `site` and is built with hugo (run `hugo serve` inside `site` to preview).
 6 | 
 7 | - Documentation is in `docs` and is built with mkdocs (inside `docs`, run `mkdocs serve` to preview after running `pip install -r requirements.txt`)
 8 | 
 9 | - `i18n` directory has the static UI for i18n translations: https://listmonk.app/i18n
10 | 


--------------------------------------------------------------------------------
/docs/docs/content/apis/apis.md:
--------------------------------------------------------------------------------
 1 | # APIs
 2 | 
 3 | All features that are available on the listmonk dashboard are also available as REST-like HTTP APIs that can be interacted with directly. Request and response bodies are JSON. This allows easy scripting of listmonk and integration with other systems, for instance, synchronisation with external subscriber databases.
 4 | 
 5 | !!! note
 6 |     If you come across API calls that are yet to be documented, please consider contributing to docs.
 7 | 
 8 | 
 9 | ## Auth
10 | HTTP API requests support BasicAuth and a Authorization `token` headers. API users and tokens with the required permissions can be created and managed on the admin UI (Admin -> Users).
11 | 
12 | ##### BasicAuth example
13 | ```shell
14 | curl -u "api_user:token" http://localhost:9000/api/lists
15 | ```
16 | 
17 | ##### Authorization token example
18 | ```shell
19 | curl -H "Authorization: token api_user:token" http://localhost:9000/api/lists
20 | ```
21 | 
22 | ## Permissions
23 | **User role**: Permissions allowed for a user are defined as a *User role* (Admin -> User roles) and then attached to a user. 
24 | 
25 | **List role**: Read / write permissions per-list can be defined as a *List role* (Admin -> User roles) and then attached to a user. 
26 | 
27 | In a *User role*, `lists:get_all` or `lists:manage_all` permission supercede and override any list specific permissions for a user defined in a *List role*.
28 | 
29 | To manage lists and subscriber list subscriptions via API requests, ensure that the appropriate permissions are attached to the API user.
30 | 
31 | ______________________________________________________________________
32 | 
33 | ## Response structure
34 | 
35 | ### Successful request
36 | 
37 | ```http
38 | HTTP/1.1 200 OK
39 | Content-Type: application/json
40 | 
41 | {
42 |     "data": {}
43 | }
44 | ```
45 | 
46 | All responses from the API server are JSON with the content-type application/json unless explicitly stated otherwise. A successful 200 OK response always has a JSON response body with a status key with the value success. The data key contains the full response payload.
47 | 
48 | ### Failed request
49 | 
50 | ```http
51 | HTTP/1.1 500 Server error
52 | Content-Type: application/json
53 | 
54 | {
55 |     "message": "Error message"
56 | }
57 | ```
58 | 
59 | A failure response is preceded by the corresponding 40x or 50x HTTP header. There may be an optional `data` key with additional payload.
60 | 
61 | ### Timestamps
62 | 
63 | All timestamp fields are in the format `2019-01-01T09:00:00.000000+05:30`. The seconds component is suffixed by the milliseconds, followed by the `+` and the timezone offset.
64 | 
65 | ### Common HTTP error codes
66 | 
67 | | Code  |                                                                             |
68 | | ----- | ----------------------------------------------------------------------------|
69 | |  400  | Missing or bad request parameters or values                                 |
70 | |  403  | Session expired or invalidate. Must relogin                                 |
71 | |  404  | Request resource was not found                                              |
72 | |  405  | Request method (GET, POST etc.) is not allowed on the requested endpoint    |
73 | |  410  | The requested resource is gone permanently                                  |
74 | |  422  | Unprocessable entity. Unable to process request as it contains invalid data |
75 | |  429  | Too many requests to the API (rate limiting)                                |
76 | |  500  | Something unexpected went wrong                                             |
77 | |  502  | The backend OMS is down and the API is unable to communicate with it        |
78 | |  503  | Service unavailable; the API is down                                        |
79 | |  504  | Gateway timeout; the API is unreachable                                     |
80 | 
81 | 
82 | ## OpenAPI (Swagger) spec
83 | 
84 | The auto-generated OpenAPI (Swagger) specification site for the APIs are available at [**listmonk.app/docs/swagger**](https://listmonk.app/docs/swagger/)
85 | 
86 | 


--------------------------------------------------------------------------------
/docs/docs/content/apis/bounces.md:
--------------------------------------------------------------------------------
  1 | # API / Bounces
  2 | 
  3 | Method   | Endpoint                                                | Description
  4 | ---------|---------------------------------------------------------|------------------------------------------------
  5 | GET      | [/api/bounces](#get-apibounces)                         | Retrieve bounce records.
  6 | DELETE   | [/api/bounces](#delete-apibounces)                      | Delete all/multiple bounce records.
  7 | DELETE   | [/api/bounces/{bounce_id}](#delete-apibouncesbounce_id) | Delete specific bounce record.
  8 | 
  9 | 
 10 | ______________________________________________________________________
 11 | 
 12 | #### GET /api/bounces
 13 | 
 14 | Retrieve the bounce records.
 15 | 
 16 | ##### Parameters
 17 | 
 18 | | Name       | Type     | Required | Description                                                      |
 19 | |:-----------|:---------|:---------|:-----------------------------------------------------------------|
 20 | | campaign_id| number   |          | Bounce record retrieval for particular campaign id               |
 21 | | page       | number   |          | Page number for pagination.                                      |
 22 | | per_page   | number   |          | Results per page. Set to 'all' to return all results.            |
 23 | | source     | string   |          |                                |
 24 | | order_by   | string   |          | Fields by which bounce records are ordered. Options:"email", "campaign_name", "source", "created_at".        |
 25 | | order      | number   |          | Sorts the result. Allowed values: 'asc','desc'                   |
 26 | 
 27 | ##### Example Request
 28 | 
 29 | ```shell
 30 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/bounces?campaign_id=1&page=1&per_page=2' \ 
 31 |     -H 'accept: application/json' -H 'Content-Type: application/x-www-form-urlencoded' \
 32 |     --data '{"source":"demo","order_by":"created_at","order":"asc"}'
 33 | ```
 34 | 
 35 | ##### Example Response
 36 | 
 37 | ```json
 38 | {
 39 |   "data": {
 40 |     "results": [
 41 |       {
 42 |         "id": 839971,
 43 |         "type": "hard",
 44 |         "source": "demo",
 45 |         "meta": {
 46 |           "some": "parameter"
 47 |         },
 48 |         "created_at": "2024-08-20T23:54:22.851858Z",
 49 |         "email": "gilles.deleuze@example.app",
 50 |         "subscriber_uuid": "32ca1f3e-1a1d-42e1-af04-df0757f420f3",
 51 |         "subscriber_id": 60,
 52 |         "campaign": {
 53 |           "id": 1,
 54 |           "name": "Test campaign"
 55 |         }
 56 |       },
 57 |       {
 58 |         "id": 839725,
 59 |         "type": "hard",
 60 |         "source": "demo",
 61 |         "meta": {
 62 |           "some": "parameter"
 63 |         },
 64 |         "created_at": "2024-08-20T22:46:36.393547Z",
 65 |         "email": "gottfried.leibniz@example.app",
 66 |         "subscriber_uuid": "5911d3f4-2346-4bfc-aad2-eb319ab0e879",
 67 |         "subscriber_id": 13,
 68 |         "campaign": {
 69 |           "id": 1,
 70 |           "name": "Test campaign"
 71 |         }
 72 |       }
 73 |     ],
 74 |     "query": "",
 75 |     "total": 528,
 76 |     "per_page": 2,
 77 |     "page": 1
 78 |   }
 79 | }
 80 | ```
 81 | 
 82 | ______________________________________________________________________
 83 | 
 84 | #### DELETE /api/bounces
 85 | 
 86 | To delete all bounces.
 87 | 
 88 | ##### Parameters
 89 | 
 90 | | Name    | Type      | Required | Description                          |
 91 | |:--------|:----------|:---------|:-------------------------------------|
 92 | | all     | bool      | Yes      | Bool to confirm deleting all bounces |
 93 | 
 94 | ##### Example Request
 95 | 
 96 | ```shell
 97 | curl -u 'api_username:access_token' -X DELETE 'http://localhost:9000/api/bounces?all=true'
 98 | ```
 99 | 
100 | ##### Example Response
101 | 
102 | ```json
103 | {
104 |     "data": true
105 | }
106 | ```
107 | 
108 | ______________________________________________________________________
109 | 
110 | #### DELETE /api/bounces
111 | 
112 | To delete multiple bounce records.
113 | 
114 | ##### Parameters
115 | 
116 | | Name    | Type      | Required | Description                          |
117 | |:--------|:----------|:---------|:-------------------------------------|
118 | | id      | number    | Yes      | Id's of bounce records to delete.    |
119 | 
120 | ##### Example Request
121 | 
122 | ```shell
123 | curl -u 'api_username:access_token' -X DELETE 'http://localhost:9000/api/bounces?id=840965&id=840168&id=840879'
124 | ```
125 | 
126 | ##### Example Response
127 | 
128 | ```json
129 | {
130 |     "data": true
131 | }
132 | ```
133 | 
134 | ______________________________________________________________________
135 | 
136 | #### DELETE /api/bounces/{bounce_id}
137 | 
138 | To delete specific bounce id.
139 | 
140 | ##### Example Request
141 | 
142 | ```shell
143 | curl -u 'api_username:access_token' -X DELETE 'http://localhost:9000/api/bounces/840965'
144 | ```
145 | 
146 | ##### Example Response
147 | 
148 | ```json
149 | {
150 |     "data": true
151 | }
152 | ```


--------------------------------------------------------------------------------
/docs/docs/content/apis/campaigns.md:
--------------------------------------------------------------------------------
  1 | # API / Campaigns
  2 | 
  3 | | Method | Endpoint                                                                    | Description                               |
  4 | |:-------|:----------------------------------------------------------------------------|:------------------------------------------|
  5 | | GET    | [/api/campaigns](#get-apicampaigns)                                         | Retrieve all campaigns.                   |
  6 | | GET    | [/api/campaigns/{campaign_id}](#get-apicampaignscampaign_id)                | Retrieve a specific campaign.             |
  7 | | GET    | [/api/campaigns/{campaign_id}/preview](#get-apicampaignscampaign_idpreview) | Retrieve preview of a campaign.           |
  8 | | GET    | [/api/campaigns/running/stats](#get-apicampaignsrunningstats)               | Retrieve stats of specified campaigns.    |
  9 | | GET    | [/api/campaigns/analytics/{type}](#get-apicampaignsanalyticstype)           | Retrieve view counts for a  campaign.     |
 10 | | POST   | [/api/campaigns](#post-apicampaigns)                                        | Create a new campaign.                    |
 11 | | POST   | [/api/campaigns/{campaign_id}/test](#post-apicampaignscampaign_idtest)      | Test campaign with arbitrary subscribers. |
 12 | | PUT    | [/api/campaigns/{campaign_id}](#put-apicampaignscampaign_id)                | Update a campaign.                        |
 13 | | PUT    | [/api/campaigns/{campaign_id}/status](#put-apicampaignscampaign_idstatus)   | Change status of a campaign.              |
 14 | | PUT    | [/api/campaigns/{campaign_id}/archive](#put-apicampaignscampaign_idarchive) | Publish campaign to public archive.       |
 15 | | DELETE | [/api/campaigns/{campaign_id}](#delete-apicampaignscampaign_id)             | Delete a campaign.                        |
 16 | 
 17 | ____________________________________________________________________________________________________________________________________
 18 | 
 19 | #### GET /api/campaigns
 20 | 
 21 | Retrieve all campaigns.
 22 | 
 23 | ##### Example Request
 24 | 
 25 | ```shell
 26 |  curl -u "api_user:token" -X GET 'http://localhost:9000/api/campaigns?page=1&per_page=100'
 27 | ```
 28 | 
 29 | ##### Parameters
 30 | 
 31 | | Name     | Type     | Required | Description                                                          |
 32 | |:---------|:---------|:---------|:---------------------------------------------------------------------|
 33 | | order    | string   |          | Sorting order: ASC for ascending, DESC for descending.               |
 34 | | order_by | string   |          | Result sorting field. Options: name, status, created_at, updated_at. |
 35 | | query    | string   |          | SQL query expression to filter campaigns.                            |
 36 | | status   | []string |          | Status to filter campaigns. Repeat in the query for multiple values. |
 37 | | tags     | []string |          | Tags to filter campaigns. Repeat in the query for multiple values.   |
 38 | | page     | number   |          | Page number for paginated results.                                   |
 39 | | per_page | number   |          | Results per page. Set as 'all' for all results.                      |
 40 | | no_body  | boolean   |          | When set to true, returns response without body content.                      |
 41 | 
 42 | ##### Example Response
 43 | 
 44 | ```json
 45 | {
 46 |     "data": {
 47 |         "results": [
 48 |             {
 49 |                 "id": 1,
 50 |                 "created_at": "2020-03-14T17:36:41.29451+01:00",
 51 |                 "updated_at": "2020-03-14T17:36:41.29451+01:00",
 52 |                 "views": 0,
 53 |                 "clicks": 0,
 54 |                 "lists": [
 55 |                     {
 56 |                         "id": 1,
 57 |                         "name": "Default list"
 58 |                     }
 59 |                 ],
 60 |                 "started_at": null,
 61 |                 "to_send": 0,
 62 |                 "sent": 0,
 63 |                 "uuid": "57702beb-6fae-4355-a324-c2fd5b59a549",
 64 |                 "type": "regular",
 65 |                 "name": "Test campaign",
 66 |                 "subject": "Welcome to listmonk",
 67 |                 "from_email": "No Reply <noreply@yoursite.com>",
 68 |                 "body": "<h3>Hi {{ .Subscriber.FirstName }}!</h3>\n\t\t\tThis is a test e-mail campaign. Your second name is {{ .Subscriber.LastName }} and you are from {{ .Subscriber.Attribs.city }}.",
 69 |                 "send_at": "2020-03-15T17:36:41.293233+01:00",
 70 |                 "status": "draft",
 71 |                 "content_type": "richtext",
 72 |                 "tags": [
 73 |                     "test-campaign"
 74 |                 ],
 75 |                 "template_id": 1,
 76 |                 "messenger": "email"
 77 |             }
 78 |         ],
 79 |         "query": "",
 80 |         "total": 1,
 81 |         "per_page": 20,
 82 |         "page": 1
 83 |     }
 84 | }
 85 | ```
 86 | 
 87 | ______________________________________________________________________
 88 | 
 89 | #### GET /api/campaigns/{campaign_id}
 90 | 
 91 | Retrieve a specific campaign.
 92 | 
 93 | ##### Parameters
 94 | 
 95 | | Name        | Type      | Required | Description  |
 96 | |:------------|:----------|:---------|:-------------|
 97 | | campaign_id | number    | Yes      | Campaign ID. |
 98 | | no_body  | boolean   |          | When set to true, returns response without body content.                      |
 99 | 
100 | ##### Example Request
101 | 
102 | ```shell
103 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/campaigns/1'
104 | ```
105 | 
106 | ##### Example Response
107 | 
108 | ```json
109 | {
110 |     "data": {
111 |         "id": 1,
112 |         "created_at": "2020-03-14T17:36:41.29451+01:00",
113 |         "updated_at": "2020-03-14T17:36:41.29451+01:00",
114 |         "views": 0,
115 |         "clicks": 0,
116 |         "lists": [
117 |             {
118 |                 "id": 1,
119 |                 "name": "Default list"
120 |             }
121 |         ],
122 |         "started_at": null,
123 |         "to_send": 0,
124 |         "sent": 0,
125 |         "uuid": "57702beb-6fae-4355-a324-c2fd5b59a549",
126 |         "type": "regular",
127 |         "name": "Test campaign",
128 |         "subject": "Welcome to listmonk",
129 |         "from_email": "No Reply <noreply@yoursite.com>",
130 |         "body": "<h3>Hi {{ .Subscriber.FirstName }}!</h3>\n\t\t\tThis is a test e-mail campaign. Your second name is {{ .Subscriber.LastName }} and you are from {{ .Subscriber.Attribs.city }}.",
131 |         "send_at": "2020-03-15T17:36:41.293233+01:00",
132 |         "status": "draft",
133 |         "content_type": "richtext",
134 |         "tags": [
135 |             "test-campaign"
136 |         ],
137 |         "template_id": 1,
138 |         "messenger": "email"
139 |     }
140 | }
141 | ```
142 | 
143 | ______________________________________________________________________
144 | 
145 | #### GET /api/campaigns/{campaign_id}/preview
146 | 
147 | Preview a specific campaign.
148 | 
149 | ##### Parameters
150 | 
151 | | Name        | Type      | Required | Description             |
152 | |:------------|:----------|:---------|:------------------------|
153 | | campaign_id | number    | Yes      | Campaign ID to preview. |
154 | 
155 | ##### Example Request
156 | 
157 | ```shell
158 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/campaigns/1/preview'
159 | ```
160 | 
161 | ##### Example Response
162 | 
163 | ```html
164 | <h3>Hi John!</h3>
165 | This is a test e-mail campaign. Your second name is Doe and you are from Bengaluru.
166 | ```
167 | 
168 | ______________________________________________________________________
169 | 
170 | #### GET /api/campaigns/running/stats
171 | 
172 | Retrieve stats of specified campaigns.
173 | 
174 | ##### Parameters
175 | 
176 | | Name        | Type      | Required | Description                    |
177 | |:------------|:----------|:---------|:-------------------------------|
178 | | campaign_id | number    | Yes      | Campaign IDs to get stats for. |
179 | 
180 | ##### Example Request
181 | 
182 | ```shell
183 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/campaigns/running/stats?campaign_id=1'
184 | ```
185 | 
186 | ##### Example Response
187 | 
188 | ```json
189 | {
190 |     "data": []
191 | }
192 | ```
193 | 
194 | ______________________________________________________________________
195 | 
196 | #### GET /api/campaigns/analytics/{type}
197 | 
198 | Retrieve stats of specified campaigns.
199 | 
200 | ##### Parameters
201 | 
202 | | Name        | Type      | Required | Description                                   |
203 | |:------------|:----------|:---------|:----------------------------------------------|
204 | | id          |number\[\] | Yes      | Campaign IDs to get stats for.                |
205 | | type        |string     | Yes      | Analytics type: views, links, clicks, bounces |
206 | | from        |string     | Yes      | Start value of date range.                |
207 | | to          |string     | Yes      | End value of date range.                |
208 | 
209 | 
210 | ##### Example Request
211 | 
212 | ```shell
213 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/campaigns/analytics/views?id=1&from=2024-08-04&to=2024-08-12'
214 | ```
215 | 
216 | ##### Example Response
217 | 
218 | ```json
219 | {
220 |   "data": [
221 |     {
222 |       "campaign_id": 1,
223 |       "count": 10,
224 |       "timestamp": "2024-08-04T00:00:00Z"
225 |     },
226 |     {
227 |       "campaign_id": 1,
228 |       "count": 14,
229 |       "timestamp": "2024-08-08T00:00:00Z"
230 |     },
231 |     {
232 |       "campaign_id": 1,
233 |       "count": 20,
234 |       "timestamp": "2024-08-09T00:00:00Z"
235 |     },
236 |     {
237 |       "campaign_id": 1,
238 |       "count": 21,
239 |       "timestamp": "2024-08-10T00:00:00Z"
240 |     },
241 |     {
242 |       "campaign_id": 1,
243 |       "count": 21,
244 |       "timestamp": "2024-08-11T00:00:00Z"
245 |     }
246 |   ]
247 | }
248 | ```
249 | 
250 | ##### Example Request
251 | 
252 | ```shell
253 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/campaigns/analytics/links?id=1&from=2024-08-04T18%3A30%3A00.624Z&to=2024-08-12T18%3A29%3A00.624Z'
254 | ```
255 | 
256 | ##### Example Response
257 | 
258 | ```json
259 | {
260 |   "data": [
261 |     {
262 |       "url": "https://freethebears.org",
263 |       "count": 294
264 |     },
265 |     {
266 |       "url": "https://calmcode.io",
267 |       "count": 278
268 |     },
269 |     {
270 |       "url": "https://climate.nasa.gov",
271 |       "count": 261
272 |     },
273 |     {
274 |       "url": "https://www.storybreathing.com",
275 |       "count": 260
276 |     }
277 |   ]
278 | }
279 | ```
280 | 
281 | ______________________________________________________________________
282 | 
283 | #### POST /api/campaigns
284 | 
285 | Create a new campaign.
286 | 
287 | ##### Parameters
288 | 
289 | | Name         | Type      | Required | Description                                                                             |
290 | |:-------------|:----------|:---------|:----------------------------------------------------------------------------------------|
291 | | name         | string    | Yes      | Campaign name.                                                                          |
292 | | subject      | string    | Yes      | Campaign email subject.                                                                 |
293 | | lists        | number\[\]  | Yes      | List IDs to send campaign to.                                                           |
294 | | from_email   | string    |          | 'From' email in campaign emails. Defaults to value from settings if not provided.       |
295 | | type         | string    | Yes      | Campaign type: 'regular' or 'optin'.                                                    |
296 | | content_type | string    | Yes      | Content type: 'richtext', 'html', 'markdown', 'plain'.                                  |
297 | | body         | string    | Yes      | Content body of campaign.                                                               |
298 | | altbody      | string    |          | Alternate plain text body for HTML (and richtext) emails.                               |
299 | | send_at      | string    |          | Timestamp to schedule campaign. Format: 'YYYY-MM-DDTHH:MM:SSZ'.                          |
300 | | messenger    | string    |          | 'email' or a custom messenger defined in settings. Defaults to 'email' if not provided. |
301 | | template_id  | number    |          | Template ID to use. Defaults to default template if not provided.                       |
302 | | tags         | string\[\]  |          | Tags to mark campaign.                                                                  |
303 | | headers      | JSON      |          | Key-value pairs to send as SMTP headers. Example: \[{"x-custom-header": "value"}\].       |
304 | 
305 | ##### Example request
306 | 
307 | ```shell
308 | curl -u "api_user:token" 'http://localhost:9000/api/campaigns' -X POST -H 'Content-Type: application/json;charset=utf-8' --data-raw '{"name":"Test campaign","subject":"Hello, world","lists":[1],"from_email":"listmonk <noreply@listmonk.yoursite.com>","content_type":"richtext","messenger":"email","type":"regular","tags":["test"],"template_id":1}'
309 | ```
310 | 
311 | ##### Example response
312 | 
313 | ```json
314 | {
315 |     "data": {
316 |         "id": 1,
317 |         "created_at": "2021-12-27T11:50:23.333485Z",
318 |         "updated_at": "2021-12-27T11:50:23.333485Z",
319 |         "views": 0,
320 |         "clicks": 0,
321 |         "bounces": 0,
322 |         "lists": [{
323 |             "id": 1,
324 |             "name": "Default list"
325 |         }],
326 |         "started_at": null,
327 |         "to_send": 1,
328 |         "sent": 0,
329 |         "uuid": "90c889cc-3728-4064-bbcb-5c1c446633b3",
330 |         "type": "regular",
331 |         "name": "Test campaign",
332 |         "subject": "Hello, world",
333 |         "from_email": "listmonk \u003cnoreply@listmonk.yoursite.com\u003e",
334 |         "body": "",
335 |         "altbody": null,
336 |         "send_at": null,
337 |         "status": "draft",
338 |         "content_type": "richtext",
339 |         "tags": ["test"],
340 |         "template_id": 1,
341 |         "messenger": "email"
342 |     }
343 | }
344 | ```
345 | 
346 | ______________________________________________________________________
347 | 
348 | #### POST /api/campaigns/{campaign_id}/test
349 | 
350 | Test campaign with arbitrary subscribers.
351 | 
352 | Use the same parameters in [POST /api/campaigns](#post-apicampaigns) in addition to the below parameters.
353 | 
354 | ##### Parameters
355 | 
356 | | Name        | Type     | Required | Description                                        |
357 | |:------------|:---------|:---------|:---------------------------------------------------|
358 | | subscribers | string\[\] | Yes      | List of subscriber e-mails to send the message to. |
359 | 
360 | ______________________________________________________________________
361 | 
362 | #### PUT /api/campaigns/{campaign_id}
363 | 
364 | Update a campaign.
365 | 
366 | > Refer to parameters from [POST /api/campaigns](#post-apicampaigns)
367 | 
368 | ______________________________________________________________________
369 | 
370 | #### PUT /api/campaigns/{campaign_id}
371 | 
372 | Update a specific campaign.
373 | 
374 | > Refer to parameters from [POST /api/campaigns](#post-apicampaigns)
375 | 
376 | ______________________________________________________________________
377 | 
378 | #### PUT /api/campaigns/{campaign_id}/status
379 | 
380 | Change status of a campaign.
381 | 
382 | ##### Parameters
383 | 
384 | | Name        | Type      | Required | Description                                                             |
385 | |:------------|:----------|:---------|:------------------------------------------------------------------------|
386 | | campaign_id | number    | Yes      | Campaign ID to change status.                                           |
387 | | status      | string    | Yes      | New status for campaign: 'scheduled', 'running', 'paused', 'cancelled'. |
388 | 
389 | ##### Note
390 | 
391 | > - Only 'scheduled' campaigns can change status to 'draft'.
392 | > - Only 'draft' campaigns can change status to 'scheduled'.
393 | > - Only 'paused' and 'draft' campaigns can start ('running' status).
394 | > - Only 'running' campaigns can change status to 'cancelled' and 'paused'.
395 | 
396 | ##### Example Request
397 | 
398 | ```shell
399 | curl -u "api_user:token" -X PUT 'http://localhost:9000/api/campaigns/1/status' \
400 | --header 'Content-Type: application/json' \
401 | --data-raw '{"status":"scheduled"}'
402 | ```
403 | 
404 | ##### Example Response
405 | 
406 | ```json
407 | {
408 |     "data": {
409 |         "id": 1,
410 |         "created_at": "2020-03-14T17:36:41.29451+01:00",
411 |         "updated_at": "2020-04-08T19:35:17.331867+01:00",
412 |         "views": 0,
413 |         "clicks": 0,
414 |         "lists": [
415 |             {
416 |                 "id": 1,
417 |                 "name": "Default list"
418 |             }
419 |         ],
420 |         "started_at": null,
421 |         "to_send": 0,
422 |         "sent": 0,
423 |         "uuid": "57702beb-6fae-4355-a324-c2fd5b59a549",
424 |         "type": "regular",
425 |         "name": "Test campaign",
426 |         "subject": "Welcome to listmonk",
427 |         "from_email": "No Reply <noreply@yoursite.com>",
428 |         "body": "<h3>Hi {{ .Subscriber.FirstName }}!</h3>\n\t\t\tThis is a test e-mail campaign. Your second name is {{ .Subscriber.LastName }} and you are from {{ .Subscriber.Attribs.city }}.",
429 |         "send_at": "2020-03-15T17:36:41.293233+01:00",
430 |         "status": "scheduled",
431 |         "content_type": "richtext",
432 |         "tags": [
433 |             "test-campaign"
434 |         ],
435 |         "template_id": 1,
436 |         "messenger": "email"
437 |     }
438 | }
439 | ```
440 | 
441 | ______________________________________________________________________
442 | 
443 | #### PUT /api/campaigns/{campaign_id}/archive
444 | 
445 | Publish campaign to public archive.
446 | 
447 | ##### Parameters
448 | 
449 | | Name               | Type       | Required | Description                                                              |
450 | |:-------------------|:-----------|:---------|:-------------------------------------------------------------------------|
451 | | campaign_id        | number     | Yes      | Campaign ID to publish to public archive.                                |
452 | | archive            | bool       | Yes      | State of the public archive.                                             |
453 | | archive_template_id| number     | No       | Archive template id. Defaults to 0.                                      |
454 | | archive_meta       | JSON string| No       | Optional Metadata to use in campaign message or template.Eg: name, email.|
455 | | archive_slug       | string     | No       | Name for page to be used in public archive URL                           |
456 | 
457 | 
458 | ##### Example Request
459 | 
460 | ```shell
461 | 
462 | curl -u "api_user:token" -X PUT 'http://localhost:8080/api/campaigns/33/archive' 
463 | --header 'Content-Type: application/json' 
464 | --data-raw '{"archive":true,"archive_template_id":1,"archive_meta":{},"archive_slug":"my-newsletter-old-edition"}'
465 | ```
466 | 
467 | ##### Example Response
468 | 
469 | ```json
470 | {
471 |   "data": {
472 |     "archive": true,
473 |     "archive_template_id": 1,
474 |     "archive_meta": {},
475 |     "archive_slug": "my-newsletter-old-edition"
476 |   }
477 | }
478 | ```
479 | 
480 | ______________________________________________________________________
481 | 
482 | #### DELETE /api/campaigns/{campaign_id}
483 | 
484 | Delete a campaign.
485 | 
486 | ##### Parameters
487 | 
488 | | Name        | Type      | Required | Description            |
489 | |:------------|:----------|:---------|:-----------------------|
490 | | campaign_id | number    | Yes      | Campaign ID to delete. |
491 | 
492 | ##### Example Request
493 | 
494 | ```shell
495 | curl -u "api_user:token" -X DELETE 'http://localhost:9000/api/campaigns/34'
496 | ```
497 | 
498 | ##### Example Response
499 | 
500 | ```json
501 | {
502 |     "data": true
503 | }
504 | ```
505 | 


--------------------------------------------------------------------------------
/docs/docs/content/apis/import.md:
--------------------------------------------------------------------------------
  1 | # API / Import
  2 | 
  3 | Method   | Endpoint                                        | Description
  4 | ---------|-------------------------------------------------|------------------------------------------------
  5 | GET      | [/api/import/subscribers](#get-apiimportsubscribers) | Retrieve import statistics.
  6 | GET      | [/api/import/subscribers/logs](#get-apiimportsubscriberslogs) | Retrieve import logs.
  7 | POST     | [/api/import/subscribers](#post-apiimportsubscribers) | Upload a file for bulk subscriber import.
  8 | DELETE   | [/api/import/subscribers](#delete-apiimportsubscribers) | Stop and remove an import.
  9 | 
 10 | ______________________________________________________________________
 11 | 
 12 | #### GET /api/import/subscribers
 13 | 
 14 | Retrieve the status of an ongoing import.
 15 | 
 16 | ##### Example Request
 17 | 
 18 | ```shell
 19 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/import/subscribers'
 20 | ```
 21 | 
 22 | ##### Example Response
 23 | 
 24 | ```json
 25 | {
 26 |     "data": {
 27 |         "name": "",
 28 |         "total": 0,
 29 |         "imported": 0,
 30 |         "status": "none"
 31 |     }
 32 | }
 33 | ```
 34 | 
 35 | ______________________________________________________________________
 36 | 
 37 | #### GET /api/import/subscribers/logs
 38 | 
 39 | Retrieve logs from an ongoing import.
 40 | 
 41 | ##### Example Request
 42 | 
 43 | ```shell
 44 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/import/subscribers/logs'
 45 | ```
 46 | 
 47 | ##### Example Response
 48 | 
 49 | ```json
 50 | {
 51 |     "data": "2020/04/08 21:55:20 processing 'import.csv'\n2020/04/08 21:55:21 imported finished\n"
 52 | }
 53 | ```
 54 | 
 55 | ______________________________________________________________________
 56 | 
 57 | #### POST /api/import/subscribers
 58 | 
 59 | Send a CSV (optionally ZIP compressed) file to import subscribers. Use a multipart form POST.
 60 | 
 61 | ##### Parameters
 62 | 
 63 | | Name   | Type        | Required | Description                              |
 64 | |:-------|:------------|:---------|:-----------------------------------------|
 65 | | params | JSON string | Yes      | Stringified JSON with import parameters. |
 66 | | file   | file        | Yes      | File for upload.                         |
 67 | 
 68 | 
 69 | #### `params` (JSON string)
 70 | | Name      | Type     | Required | Description                                                                                                                        |
 71 | |:----------|:---------|:---------|:-----------------------------------------------------------------------------------------------------------------------------------|
 72 | | mode      | string   | Yes      | `subscribe` or `blocklist`                                                                                                         |
 73 | | delim     | string   | Yes      | Single character indicating delimiter used in the CSV file, eg: `,`                                                                |
 74 | | lists     | []number | Yes      | Single character indicating delimiter used in the CSV file, eg: `,`                                                                |
 75 | | overwrite | bool     | Yes      | Whether to overwrite the subscriber parameters including subscriptions or ignore records that are already present in the database. |
 76 | 
 77 | ##### Example Request
 78 | 
 79 | ```shell
 80 | curl -u "api_user:token" -X POST 'http://localhost:9000/api/import/subscribers' \
 81 |   -F 'params={"mode":"subscribe", "subscription_status":"confirmed", "delim":",", "lists":[1, 2], "overwrite": true}' \
 82 |   -F "file=@/path/to/subs.csv"
 83 | ```
 84 | 
 85 | ##### Example Response
 86 | 
 87 | ```json
 88 |     {
 89 |         "mode": "subscribe", // subscribe or blocklist
 90 |         "delim": ",",        // delimiter in the uploaded file
 91 |         "lists":[1],         // array of list IDs to import into
 92 |         "overwrite": true    // overwrite existing entries or skip them?
 93 |     }
 94 | ```
 95 | 
 96 | ______________________________________________________________________
 97 | 
 98 | #### DELETE /api/import/subscribers
 99 | 
100 | Stop and delete an ongoing import.
101 | 
102 | ##### Example Request
103 | 
104 | ```shell
105 | curl -u "api_user:token" -X DELETE 'http://localhost:9000/api/import/subscribers' 
106 | ```
107 | 
108 | ##### Example Response
109 | 
110 | ```json
111 | {
112 |     "data": {
113 |         "name": "",
114 |         "total": 0,
115 |         "imported": 0,
116 |         "status": "none"
117 |     }
118 | }
119 | ```
120 | 


--------------------------------------------------------------------------------
/docs/docs/content/apis/lists.md:
--------------------------------------------------------------------------------
  1 | # API / Lists
  2 | 
  3 | | Method | Endpoint                                        | Description               |
  4 | |:-------|:------------------------------------------------|:--------------------------|
  5 | | GET    | [/api/lists](#get-apilists)                     | Retrieve all lists.       |
  6 | | GET    | [/api/public/lists](#get-public-apilists)       | Retrieve public lists.|
  7 | | GET    | [/api/lists/{list_id}](#get-apilistslist_id)    | Retrieve a specific list. |
  8 | | POST   | [/api/lists](#post-apilists)                    | Create a new list.        |
  9 | | PUT    | [/api/lists/{list_id}](#put-apilistslist_id)    | Update a list.            |
 10 | | DELETE | [/api/lists/{list_id}](#delete-apilistslist_id) | Delete a list.            |
 11 | 
 12 | ______________________________________________________________________
 13 | 
 14 | #### GET /api/lists
 15 | 
 16 | Retrieve lists.
 17 | 
 18 | ##### Parameters
 19 | 
 20 | | Name     | Type     | Required | Description                                                      |
 21 | |:---------|:---------|:---------|:-----------------------------------------------------------------|
 22 | | query    | string   |          | string for list name search.                                     |
 23 | | status   | []string |          | Status to filter lists. Repeat in the query for multiple values. |
 24 | | tag      | []string |          | Tags to filter lists. Repeat in the query for multiple values.   |
 25 | | order_by | string   |          | Sort field. Options: name, status, created_at, updated_at.       |
 26 | | order    | string   |          | Sorting order. Options: ASC, DESC.                               |
 27 | | page     | number   |          | Page number for pagination.                                      |
 28 | | per_page | number   |          | Results per page. Set to 'all' to return all results.            |
 29 | 
 30 | ##### Example Request
 31 | 
 32 | ```shell
 33 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/lists?page=1&per_page=100'
 34 | ```
 35 | 
 36 | ##### Example Response
 37 | 
 38 | ```json
 39 | {
 40 |     "data": {
 41 |         "results": [
 42 |             {
 43 |                 "id": 1,
 44 |                 "created_at": "2020-02-10T23:07:16.194843+01:00",
 45 |                 "updated_at": "2020-03-06T22:32:01.118327+01:00",
 46 |                 "uuid": "ce13e971-c2ed-4069-bd0c-240e9a9f56f9",
 47 |                 "name": "Default list",
 48 |                 "type": "public",
 49 |                 "optin": "double",
 50 |                 "tags": [
 51 |                     "test"
 52 |                 ],
 53 |                 "subscriber_count": 2
 54 |             },
 55 |             {
 56 |                 "id": 2,
 57 |                 "created_at": "2020-03-04T21:12:09.555013+01:00",
 58 |                 "updated_at": "2020-03-06T22:34:46.405031+01:00",
 59 |                 "uuid": "f20a2308-dfb5-4420-a56d-ecf0618a102d",
 60 |                 "name": "get",
 61 |                 "type": "private",
 62 |                 "optin": "single",
 63 |                 "tags": [],
 64 |                 "subscriber_count": 0
 65 |             }
 66 |         ],
 67 |         "total": 5,
 68 |         "per_page": 20,
 69 |         "page": 1
 70 |     }
 71 | }
 72 | ```
 73 | 
 74 | ______________________________________________________________________
 75 | 
 76 | #### GET /api/public/lists
 77 | 
 78 | Retrieve public lists with name and uuid to submit a subscription. This is an unauthenticated call to enable scripting to subscription form.
 79 | 
 80 | ##### Example Request
 81 | 
 82 | ```shell
 83 | curl -X GET 'http://localhost:9000/api/public/lists'
 84 | ```
 85 | 
 86 | ##### Example Response
 87 | 
 88 | ```json
 89 | [
 90 |   {
 91 |     "uuid": "55e243af-80c6-4169-8d7f-bc571e0269e9",
 92 |     "name": "Opt-in list"
 93 |   }
 94 | ]
 95 | ```
 96 | ______________________________________________________________________
 97 | 
 98 | #### GET /api/lists/{list_id}
 99 | 
100 | Retrieve a specific list.
101 | 
102 | ##### Parameters
103 | 
104 | | Name    | Type      | Required | Description                 |
105 | |:--------|:----------|:---------|:----------------------------|
106 | | list_id | number    | Yes      | ID of the list to retrieve. |
107 | 
108 | ##### Example Request
109 | 
110 | ```shell
111 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/lists/5'
112 | ```
113 | 
114 | ##### Example Response
115 | 
116 | ```json
117 | {
118 |     "data": {
119 |         "id": 5,
120 |         "created_at": "2020-03-07T06:31:06.072483+01:00",
121 |         "updated_at": "2020-03-07T06:31:06.072483+01:00",
122 |         "uuid": "1bb246ab-7417-4cef-bddc-8fc8fc941d3a",
123 |         "name": "Test list",
124 |         "type": "public",
125 |         "optin": "double",
126 |         "tags": [],
127 |         "subscriber_count": 0
128 |     }
129 | }
130 | ```
131 | 
132 | ______________________________________________________________________
133 | 
134 | #### POST /api/lists
135 | 
136 | Create a new list.
137 | 
138 | ##### Parameters
139 | 
140 | | Name  | Type      | Required | Description                             |
141 | |:------|:----------|:---------|:----------------------------------------|
142 | | name  | string    | Yes      | Name of the new list.                   |
143 | | type  | string    | Yes      | Type of list. Options: private, public. |
144 | | optin | string    | Yes      | Opt-in type. Options: single, double.   |
145 | | tags  | string\[\]  |          | Associated tags for a list.             |
146 | | description | string | No | Description of the new list. |
147 | 
148 | ##### Example Request
149 | 
150 | ```shell
151 | curl -u "api_user:token" -X POST 'http://localhost:9000/api/lists'
152 | ```
153 | 
154 | ##### Example Response
155 | 
156 | ```json
157 | {
158 |     "data": {
159 |         "id": 5,
160 |         "created_at": "2020-03-07T06:31:06.072483+01:00",
161 |         "updated_at": "2020-03-07T06:31:06.072483+01:00",
162 |         "uuid": "1bb246ab-7417-4cef-bddc-8fc8fc941d3a",
163 |         "name": "Test list",
164 |         "type": "public",
165 |         "tags": [],
166 |         "subscriber_count": 0,
167 |         "description": "This is a test list"
168 |     }
169 | }
170 | null
171 | ```
172 | 
173 | ______________________________________________________________________
174 | 
175 | #### PUT /api/lists/{list_id}
176 | 
177 | Update a list.
178 | 
179 | ##### Parameters
180 | 
181 | | Name    | Type      | Required | Description                             |
182 | |:--------|:----------|:---------|:----------------------------------------|
183 | | list_id | number    | Yes      | ID of the list to update.               |
184 | | name    | string    |          | New name for the list.                  |
185 | | type    | string    |          | Type of list. Options: private, public. |
186 | | optin   | string    |          | Opt-in type. Options: single, double.   |
187 | | tags    | string\[\]  |          | Associated tags for the list.           |
188 | | description | string |         | Description of the new list.            |
189 | 
190 | ##### Example Request
191 | 
192 | ```shell
193 | curl -u "api_user:token" -X PUT 'http://localhost:9000/api/lists/5' \
194 | --form 'name=modified test list' \
195 | --form 'type=private'
196 | ```
197 | 
198 | ##### Example Response
199 | 
200 | ```json
201 | {
202 |     "data": {
203 |         "id": 5,
204 |         "created_at": "2020-03-07T06:31:06.072483+01:00",
205 |         "updated_at": "2020-03-07T06:52:15.208075+01:00",
206 |         "uuid": "1bb246ab-7417-4cef-bddc-8fc8fc941d3a",
207 |         "name": "modified test list",
208 |         "type": "private",
209 |         "optin": "single",
210 |         "tags": [],
211 |         "subscriber_count": 0,
212 |         "description": "This is a test list"
213 |     }
214 | }
215 | ```
216 | 
217 | ______________________________________________________________________
218 | 
219 | #### DELETE /api/lists/{list_id}
220 | 
221 | Delete a specific subscriber.
222 | 
223 | ##### Parameters
224 | 
225 | | Name    | Type      | Required | Description               |
226 | |:--------|:----------|:---------|:--------------------------|
227 | | list_id | Number    | Yes      | ID of the list to delete. |
228 | 
229 | ##### Example Request
230 | 
231 | ```shell
232 | curl -u 'api_username:access_token' -X DELETE 'http://localhost:9000/api/lists/1'
233 | ```
234 | 
235 | ##### Example Response
236 | 
237 | ```json
238 | {
239 |     "data": true
240 | }
241 | ```
242 | 


--------------------------------------------------------------------------------
/docs/docs/content/apis/media.md:
--------------------------------------------------------------------------------
  1 | # API / Media
  2 | 
  3 | Method | Endpoint                                             | Description
  4 | -------|------------------------------------------------------|---------------------------------
  5 | GET    | [/api/media](#get-apimedia)                          | Get uploaded media file
  6 | GET    | [/api/media/{media_id}](#get-apimediamedia_id)       | Get specific uploaded media file
  7 | POST   | [/api/media](#post-apimedia)                         | Upload media file
  8 | DELETE | [/api/media/{media_id}](#delete-apimediamedia_id)    | Delete uploaded media file
  9 | 
 10 | ______________________________________________________________________
 11 | 
 12 | #### GET /api/media
 13 | 
 14 | Get an uploaded media file.
 15 | 
 16 | ##### Example Request
 17 | 
 18 | ```shell
 19 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/media' \
 20 | --header 'Content-Type: multipart/form-data; boundary=--------------------------093715978792575906250298'
 21 | ```
 22 | 
 23 | ##### Example Response
 24 | 
 25 | ```json
 26 | {
 27 |     "data": [
 28 |         {
 29 |             "id": 1,
 30 |             "uuid": "ec7b45ce-1408-4e5c-924e-965326a20287",
 31 |             "filename": "Media file",
 32 |             "created_at": "2020-04-08T22:43:45.080058+01:00",
 33 |             "thumb_url": "/uploads/image_thumb.jpg",
 34 |             "uri": "/uploads/image.jpg"
 35 |         }
 36 |     ]
 37 | }
 38 | ```
 39 | ______________________________________________________________________
 40 | 
 41 | #### GET /api/media/{media_id}
 42 | 
 43 | Retrieve a specific media.
 44 | 
 45 | ##### Parameters
 46 | 
 47 | | Name          | Type      | Required | Description      |
 48 | |:--------------|:----------|:---------|:-----------------|
 49 | | media_id      | Number    | Yes      | Media ID.        |
 50 | 
 51 | ##### Example Request
 52 | 
 53 | ```shell
 54 | curl -u 'api_username:access_token' 'http://localhost:9000/api/media/7' 
 55 | ```
 56 | 
 57 | ##### Example Response
 58 | 
 59 | ```json
 60 | {
 61 |   "data": 
 62 |     {
 63 |         "id": 7,
 64 |         "uuid": "62e32e97-d6ca-4441-923f-b62607000dd1",
 65 |         "filename": "ResumeB.pdf",
 66 |         "content_type": "application/pdf",
 67 |         "created_at": "2024-08-06T11:28:53.888257+05:30",
 68 |         "thumb_url": null,
 69 |         "provider": "filesystem",
 70 |         "meta": {},
 71 |         "url": "http://localhost:9000/uploads/ResumeB.pdf"
 72 |     }
 73 | }
 74 | ```
 75 | ______________________________________________________________________
 76 | 
 77 | #### POST /api/media
 78 | 
 79 | Upload a media file.
 80 | 
 81 | ##### Parameters
 82 | 
 83 | | Field | Type      | Required | Description         |
 84 | |-------|-----------|----------|---------------------|
 85 | | file  | File      | Yes      | Media file to upload|
 86 | 
 87 | ##### Example Request
 88 | 
 89 | ```shell
 90 | curl -u "api_user:token" -X POST 'http://localhost:9000/api/media' \
 91 | --header 'Content-Type: multipart/form-data; boundary=--------------------------183679989870526937212428' \
 92 | --form 'file=@/path/to/image.jpg'
 93 | ```
 94 | 
 95 | ##### Example Response
 96 | 
 97 | ```json
 98 | {
 99 |     "data": {
100 |         "id": 1,
101 |         "uuid": "ec7b45ce-1408-4e5c-924e-965326a20287",
102 |         "filename": "Media file",
103 |         "created_at": "2020-04-08T22:43:45.080058+01:00",
104 |         "thumb_uri": "/uploads/image_thumb.jpg",
105 |         "uri": "/uploads/image.jpg"
106 |     }
107 | }
108 | ```
109 | 
110 | ______________________________________________________________________
111 | 
112 | #### DELETE /api/media/{media_id}
113 | 
114 | Delete an uploaded media file.
115 | 
116 | ##### Parameters
117 | 
118 | | Field    | Type      | Required | Description             |
119 | |----------|-----------|----------|-------------------------|
120 | | media_id | number    | Yes      | ID of media file to delete |
121 | 
122 | ##### Example Request
123 | 
124 | ```shell
125 | curl -u "api_user:token" -X DELETE 'http://localhost:9000/api/media/1'
126 | ```
127 | 
128 | ##### Example Response
129 | 
130 | ```json
131 | {
132 |     "data": true
133 | }
134 | ```
135 | 


--------------------------------------------------------------------------------
/docs/docs/content/apis/sdks.md:
--------------------------------------------------------------------------------
 1 | # SDKs and client libraries
 2 | 
 3 | A list of 3rd party client libraries and SDKs that have been written for listmonk APIs.
 4 | 
 5 | !!! note
 6 | 	The list is community sourced. They have not been verified and are not officially supported.
 7 | 
 8 | - [WordPress - WooCommerce plugin](https://github.com/post-duif/integration-listmonk-wordpress-plugin) integration for listmonk
 9 | - [listmonk ](https://github.com/mikeckennedy/listmonk) — Python API client
10 | - [listmonk-api](https://github.com/Knuckles-Team/listmonk-api) — Python API client
11 | - [frappe_listmonk](https://github.com/anandology/frappe_listmonk) — Frappe framework integration for listmonk
12 | - [auto-newsletter-listmonk](https://github.com/chaddyc/auto-newsletter-listmonk) — Ghost CMS integration
13 | - [listmonk-newsletter](https://github.com/iloveitaly/listmonk-newsletter) - RSS to listmonk integration for email newsletters
14 | - [listmonk-crysctal](https://github.com/russ/listmonk-crystal) — Crystal lang API client
15 | - [terraform-provider-listmonk](https://github.com/Muravlev/terraform-provider-listmonk) — Manage listmonk templates in Terraform
16 | - [listmonk-php-client](https://github.com/arunnabraham/listmonk-php-client) — PHP API client
17 | - [php-listmonk](https://github.com/junisan/php-listmonk) — PHP API client
18 | - [go-listmonk](https://github.com/EzeXchange-API/go-listmonk) — Go API client
19 | - [listmonk-nodejs-api](https://github.com/mihairaulea/listmonk-nodejs-api) — NodeJS API client
20 | 


--------------------------------------------------------------------------------
/docs/docs/content/apis/subscribers.md:
--------------------------------------------------------------------------------
  1 | # API / Subscribers
  2 | 
  3 | | Method | Endpoint                                                                                | Description                                    |
  4 | | ------ | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
  5 | | GET    | [/api/subscribers](#get-apisubscribers)                                                 | Query and retrieve subscribers.                |
  6 | | GET    | [/api/subscribers/{subscriber_id}](#get-apisubscriberssubscriber_id)                    | Retrieve a specific subscriber.                |
  7 | | GET    | [/api/subscribers/{subscriber_id}/export](#get-apisubscriberssubscriber_idexport)       | Export a specific subscriber.                  |
  8 | | GET    | [/api/subscribers/{subscriber_id}/bounces](#get-apisubscriberssubscriber_idbounces)     | Retrieve a  subscriber bounce records.         |
  9 | | POST   | [/api/subscribers](#post-apisubscribers)                                                | Create a new subscriber.                       |
 10 | | POST   | [/api/subscribers/{subscriber_id}/optin](#post-apisubscriberssubscriber_idoptin)        | Sends optin confirmation email to subscribers. |
 11 | | POST   | [/api/public/subscription](#post-apipublicsubscription)                                 | Create a public subscription.                  |
 12 | | PUT    | [/api/subscribers/lists](#put-apisubscriberslists)                                      | Modify subscriber list memberships.            |
 13 | | PUT    | [/api/subscribers/{subscriber_id}](#put-apisubscriberssubscriber_id)                    | Update a specific subscriber.                  |
 14 | | PUT    | [/api/subscribers/{subscriber_id}/blocklist](#put-apisubscriberssubscriber_idblocklist) | Blocklist a specific subscriber.               |
 15 | | PUT    | [/api/subscribers/blocklist](#put-apisubscribersblocklist)                              | Blocklist one or many subscribers.             |
 16 | | PUT    | [/api/subscribers/query/blocklist](#put-apisubscribersqueryblocklist)                   | Blocklist subscribers based on SQL expression. |
 17 | | DELETE | [/api/subscribers/{subscriber_id}](#delete-apisubscriberssubscriber_id)                 | Delete a specific subscriber.                  |
 18 | | DELETE | [/api/subscribers/{subscriber_id}/bounces](#delete-apisubscriberssubscriber_idbounces)  | Delete a specific subscriber's bounce records. |
 19 | | DELETE | [/api/subscribers](#delete-apisubscribers)                                              | Delete one or more subscribers.                |
 20 | | POST   | [/api/subscribers/query/delete](#post-apisubscribersquerydelete)                        | Delete subscribers based on SQL expression.    |
 21 | 
 22 | ______________________________________________________________________
 23 | 
 24 | #### GET /api/subscribers
 25 | 
 26 | Retrieve all subscribers.
 27 | 
 28 | ##### Query parameters
 29 | 
 30 | | Name                | Type   | Required | Description                                                           |
 31 | |:--------------------|:-------|:---------|:----------------------------------------------------------------------|
 32 | | query               | string |          | Subscriber search by SQL expression.                                  |
 33 | | list_id             | int[]  |          | ID of lists to filter by. Repeat in the query for multiple values.    |
 34 | | subscription_status | string |          | Subscription status to filter by if there are one or more `list_id`s. |
 35 | | order_by            | string |          | Result sorting field. Options: name, status, created_at, updated_at.  |
 36 | | order               | string |          | Sorting order: ASC for ascending, DESC for descending.                |
 37 | | page                | number |          | Page number for paginated results.                                    |
 38 | | per_page            | number |          | Results per page. Set as 'all' for all results.                       |
 39 | 
 40 | ##### Example Request
 41 | 
 42 | ```shell
 43 | curl -u 'api_username:access_token' 'http://localhost:9000/api/subscribers?page=1&per_page=100' 
 44 | ```
 45 | 
 46 | ```shell
 47 | curl -u 'api_username:access_token' 'http://localhost:9000/api/subscribers?list_id=1&list_id=2&page=1&per_page=100'
 48 | ```
 49 | 
 50 | ```shell
 51 | curl -u 'api_username:access_token' -X GET 'http://localhost:9000/api/subscribers' \
 52 |     --url-query 'page=1' \
 53 |     --url-query 'per_page=100' \
 54 |     --url-query "query=subscribers.name LIKE 'Test%' AND subscribers.attribs->>'city' = 'Bengaluru'"
 55 | ```
 56 | 
 57 | ##### Example Response
 58 | 
 59 | ```json
 60 | {
 61 |     "data": {
 62 |         "results": [
 63 |             {
 64 |                 "id": 1,
 65 |                 "created_at": "2020-02-10T23:07:16.199433+01:00",
 66 |                 "updated_at": "2020-02-10T23:07:16.199433+01:00",
 67 |                 "uuid": "ea06b2e7-4b08-4697-bcfc-2a5c6dde8f1c",
 68 |                 "email": "john@example.com",
 69 |                 "name": "John Doe",
 70 |                 "attribs": {
 71 |                     "city": "Bengaluru",
 72 |                     "good": true,
 73 |                     "type": "known"
 74 |                 },
 75 |                 "status": "enabled",
 76 |                 "lists": [
 77 |                     {
 78 |                         "subscription_status": "unconfirmed",
 79 |                         "id": 1,
 80 |                         "uuid": "ce13e971-c2ed-4069-bd0c-240e9a9f56f9",
 81 |                         "name": "Default list",
 82 |                         "type": "public",
 83 |                         "tags": [
 84 |                             "test"
 85 |                         ],
 86 |                         "created_at": "2020-02-10T23:07:16.194843+01:00",
 87 |                         "updated_at": "2020-02-10T23:07:16.194843+01:00"
 88 |                     }
 89 |                 ]
 90 |             },
 91 |             {
 92 |                 "id": 2,
 93 |                 "created_at": "2020-02-18T21:10:17.218979+01:00",
 94 |                 "updated_at": "2020-02-18T21:10:17.218979+01:00",
 95 |                 "uuid": "ccf66172-f87f-4509-b7af-e8716f739860",
 96 |                 "email": "quadri@example.com",
 97 |                 "name": "quadri",
 98 |                 "attribs": {},
 99 |                 "status": "enabled",
100 |                 "lists": [
101 |                     {
102 |                         "subscription_status": "unconfirmed",
103 |                         "id": 1,
104 |                         "uuid": "ce13e971-c2ed-4069-bd0c-240e9a9f56f9",
105 |                         "name": "Default list",
106 |                         "type": "public",
107 |                         "tags": [
108 |                             "test"
109 |                         ],
110 |                         "created_at": "2020-02-10T23:07:16.194843+01:00",
111 |                         "updated_at": "2020-02-10T23:07:16.194843+01:00"
112 |                     }
113 |                 ]
114 |             },
115 |             {
116 |                 "id": 3,
117 |                 "created_at": "2020-02-19T19:10:49.36636+01:00",
118 |                 "updated_at": "2020-02-19T19:10:49.36636+01:00",
119 |                 "uuid": "5d940585-3cc8-4add-b9c5-76efba3c6edd",
120 |                 "email": "sugar@example.com",
121 |                 "name": "sugar",
122 |                 "attribs": {},
123 |                 "status": "enabled",
124 |                 "lists": []
125 |             }
126 |         ],
127 |         "query": "",
128 |         "total": 3,
129 |         "per_page": 20,
130 |         "page": 1
131 |     }
132 | }
133 | ```
134 | 
135 | ______________________________________________________________________
136 | 
137 | #### GET /api/subscribers/{subscriber_id}
138 | 
139 | Retrieve a specific subscriber.
140 | 
141 | ##### Parameters
142 | 
143 | | Name          | Type      | Required | Description      |
144 | |:--------------|:----------|:---------|:-----------------|
145 | | subscriber_id | Number    | Yes      | Subscriber's ID. |
146 | 
147 | ##### Example Request
148 | 
149 | ```shell
150 | curl -u 'api_username:access_token' 'http://localhost:9000/api/subscribers/1' 
151 | ```
152 | 
153 | ##### Example Response
154 | 
155 | ```json
156 | {
157 |     "data": {
158 |         "id": 1,
159 |         "created_at": "2020-02-10T23:07:16.199433+01:00",
160 |         "updated_at": "2020-02-10T23:07:16.199433+01:00",
161 |         "uuid": "ea06b2e7-4b08-4697-bcfc-2a5c6dde8f1c",
162 |         "email": "john@example.com",
163 |         "name": "John Doe",
164 |         "attribs": {
165 |             "city": "Bengaluru",
166 |             "good": true,
167 |             "type": "known"
168 |         },
169 |         "status": "enabled",
170 |         "lists": [
171 |             {
172 |                 "subscription_status": "unconfirmed",
173 |                 "id": 1,
174 |                 "uuid": "ce13e971-c2ed-4069-bd0c-240e9a9f56f9",
175 |                 "name": "Default list",
176 |                 "type": "public",
177 |                 "tags": [
178 |                     "test"
179 |                 ],
180 |                 "created_at": "2020-02-10T23:07:16.194843+01:00",
181 |                 "updated_at": "2020-02-10T23:07:16.194843+01:00"
182 |             }
183 |         ]
184 |     }
185 | }
186 | ```
187 | ______________________________________________________________________
188 | 
189 | #### GET /api/subscribers/{subscriber_id}/export
190 | 
191 | Export a specific subscriber data that gives profile, list subscriptions, campaign views and link clicks information. Names of private lists are replaced with "Private list". 
192 | 
193 | ##### Parameters
194 | 
195 | | Name          | Type      | Required | Description      |
196 | |:--------------|:----------|:---------|:-----------------|
197 | | subscriber_id | Number    | Yes      | Subscriber's ID. |
198 | 
199 | ##### Example Request
200 | 
201 | ```shell
202 | curl -u 'api_username:access_token' 'http://localhost:9000/api/subscribers/1/export' 
203 | ```
204 | 
205 | ##### Example Response
206 | 
207 | ```json
208 | {
209 |   "profile": [
210 |     {
211 |       "id": 1,
212 |       "uuid": "c2cc0b31-b485-4d72-8ce8-b47081beadec",
213 |       "email": "john@example.com",
214 |       "name": "John Doe",
215 |       "attribs": {
216 |         "city": "Bengaluru",
217 |         "good": true,
218 |         "type": "known"
219 |       },
220 |       "status": "enabled",
221 |       "created_at": "2024-07-29T11:01:31.478677+05:30",
222 |       "updated_at": "2024-07-29T11:01:31.478677+05:30"
223 |     }
224 |   ],
225 |   "subscriptions": [
226 |     {
227 |       "subscription_status": "unconfirmed",
228 |       "name": "Private list",
229 |       "type": "private",
230 |       "created_at": "2024-07-29T11:01:31.478677+05:30"
231 |     }
232 |   ],
233 |   "campaign_views": [],
234 |   "link_clicks": []
235 | }
236 | ```
237 | ______________________________________________________________________
238 | 
239 | #### GET /api/subscribers/{subscriber_id}/bounces
240 | 
241 | Get a specific subscriber bounce records.
242 | ##### Parameters
243 | 
244 | | Name          | Type      | Required | Description      |
245 | |:--------------|:----------|:---------|:-----------------|
246 | | subscriber_id | Number    | Yes      | Subscriber's ID. |
247 | 
248 | ##### Example Request
249 | 
250 | ```shell
251 | curl -u 'api_username:access_token' 'http://localhost:9000/api/subscribers/1/bounces' 
252 | ```
253 | 
254 | ##### Example Response
255 | 
256 | ```json
257 | {
258 |   "data": [
259 |     {
260 |       "id": 841706,
261 |       "type": "hard",
262 |       "source": "demo",
263 |       "meta": {
264 |         "some": "parameter"
265 |       },
266 |       "created_at": "2024-08-22T09:05:12.862877Z",
267 |       "email": "thomas.hobbes@example.com",
268 |       "subscriber_uuid": "137c0d83-8de6-44e2-a55f-d4238ab21969",
269 |       "subscriber_id": 99,
270 |       "campaign": {
271 |         "id": 2,
272 |         "name": "Welcome to listmonk"
273 |       }
274 |     },
275 |     {
276 |       "id": 841680,
277 |       "type": "hard",
278 |       "source": "demo",
279 |       "meta": {
280 |         "some": "parameter"
281 |       },
282 |       "created_at": "2024-08-19T14:07:53.141917Z",
283 |       "email": "thomas.hobbes@example.com",
284 |       "subscriber_uuid": "137c0d83-8de6-44e2-a55f-d4238ab21969",
285 |       "subscriber_id": 99,
286 |       "campaign": {
287 |         "id": 1,
288 |         "name": "Test campaign"
289 |       }
290 |     }
291 |   ]
292 | }
293 | ```
294 | 
295 | ______________________________________________________________________
296 | 
297 | #### POST /api/subscribers
298 | 
299 | Create a new subscriber.
300 | 
301 | ##### Parameters
302 | 
303 | | Name                     | Type      | Required | Description                                                                                          |
304 | |:-------------------------|:----------|:---------|:-----------------------------------------------------------------------------------------------------|
305 | | email                    | string    | Yes      | Subscriber's email address.                                                                          |
306 | | name                     | string    | Yes      | Subscriber's name.                                                                                   |
307 | | status                   | string    | Yes      | Subscriber's status: `enabled`, `blocklisted`.                                           |
308 | | lists                    | number\[\]  |          | List of list IDs to subscribe to.                                                                    |
309 | | attribs                  | JSON      |          | Attributes of the new subscriber.                                                                    |
310 | | preconfirm_subscriptions | bool      |          | If true, subscriptions are marked as confirmed and no-optin emails are sent for double opt-in lists. |
311 | 
312 | ##### Example Request
313 | 
314 | ```shell
315 | curl -u 'api_username:access_token' 'http://localhost:9000/api/subscribers' -H 'Content-Type: application/json' \
316 |     --data '{"email":"subsriber@domain.com","name":"The Subscriber","status":"enabled","lists":[1],"attribs":{"city":"Bengaluru","projects":3,"stack":{"languages":["go","python"]}}}'
317 | ```
318 | 
319 | ##### Example Response
320 | 
321 | ```json
322 | {
323 |   "data": {
324 |     "id": 3,
325 |     "created_at": "2019-07-03T12:17:29.735507+05:30",
326 |     "updated_at": "2019-07-03T12:17:29.735507+05:30",
327 |     "uuid": "eb420c55-4cfb-4972-92ba-c93c34ba475d",
328 |     "email": "subsriber@domain.com",
329 |     "name": "The Subscriber",
330 |     "attribs": {
331 |       "city": "Bengaluru",
332 |       "projects": 3,
333 |       "stack": { "languages": ["go", "python"] }
334 |     },
335 |     "status": "enabled",
336 |     "lists": [1]
337 |   }
338 | }
339 | ```
340 | 
341 | ______________________________________________________________________
342 | 
343 | #### POST /api/subscribers/{subscribers_id}/optin
344 | 
345 | Sends optin confirmation email to subscribers.
346 | 
347 | ##### Example Request
348 | 
349 | ```shell
350 | curl -u 'api_username:access_token' 'http://localhost:9000/api/subscribers/11/optin' -H 'Content-Type: application/json' \
351 | --data {}
352 | ```
353 | 
354 | ##### Example Response
355 | 
356 | ```json
357 | {
358 |     "data": true
359 | } 
360 | ```
361 | ______________________________________________________________________
362 | 
363 | #### POST /api/public/subscription
364 | 
365 | Create a public subscription, accepts both form encoded or JSON encoded body.
366 | 
367 | ##### Parameters
368 | 
369 | | Name       | Type      | Required | Description                 |
370 | |:-----------|:----------|:---------|:----------------------------|
371 | | email      | string    | Yes      | Subscriber's email address. |
372 | | name       | string    |          | Subscriber's name.          |
373 | | list_uuids | string\[\]  | Yes      | List of list UUIDs.         |
374 | 
375 | ##### Example JSON Request
376 | 
377 | ```shell
378 | curl 'http://localhost:9000/api/public/subscription' -H 'Content-Type: application/json' \
379 |     --data '{"email":"subsriber@domain.com","name":"The Subscriber","list_uuids": ["eb420c55-4cfb-4972-92ba-c93c34ba475d", "0c554cfb-eb42-4972-92ba-c93c34ba475d"]}'
380 | ```
381 | 
382 | ##### Example Form Request
383 | 
384 | ```shell
385 | curl -u 'http://localhost:9000/api/public/subscription' \
386 |     -d 'email=subsriber@domain.com' -d 'name=The Subscriber' -d 'l=eb420c55-4cfb-4972-92ba-c93c34ba475d' -d 'l=0c554cfb-eb42-4972-92ba-c93c34ba475d'
387 | ```
388 | 
389 | Note: For form request, use `l` for multiple lists instead of `lists`.
390 | 
391 | ##### Example Response
392 | 
393 | ```json
394 | {
395 |   "data": true
396 | }
397 | ```
398 | 
399 | ______________________________________________________________________
400 | 
401 | #### PUT /api/subscribers/lists
402 | 
403 | Modify subscriber list memberships.
404 | 
405 | ##### Parameters
406 | 
407 | | Name            | Type      | Required           | Description                                                       |
408 | |:----------------|:----------|:-------------------|:------------------------------------------------------------------|
409 | | ids             | number\[\]  | Yes                | Array of user IDs to be modified.                                 |
410 | | action          | string    | Yes                | Action to be applied: `add`, `remove`, or `unsubscribe`.          |
411 | | target_list_ids | number\[\]  | Yes                | Array of list IDs to be modified.                                 |
412 | | status          | string    | Required for `add` | Subscriber status: `confirmed`, `unconfirmed`, or `unsubscribed`. |
413 | 
414 | ##### Example Request
415 | 
416 | ```shell
417 | curl -u 'api_username:access_token' -X PUT 'http://localhost:9000/api/subscribers/lists' \
418 | -H 'Content-Type: application/json' \
419 | --data-raw '{"ids": [1, 2, 3], "action": "add", "target_list_ids": [4, 5, 6], "status": "confirmed"}'
420 | ```
421 | 
422 | ##### Example Response
423 | 
424 | ```json
425 | {
426 |     "data": true
427 | } 
428 | ```
429 | 
430 | ______________________________________________________________________
431 | 
432 | #### PUT /api/subscribers/{subscriber_id}
433 | 
434 | Update a specific subscriber.
435 | 
436 | > Refer to parameters from [POST /api/subscribers](#post-apisubscribers). Note: All parameters must be set, if not, the subscriber will be removed from all previously assigned lists.
437 | 
438 | ______________________________________________________________________
439 | 
440 | #### PUT /api/subscribers/{subscriber_id}/blocklist
441 | 
442 | Blocklist a specific subscriber.
443 | 
444 | ##### Parameters
445 | 
446 | | Name          | Type      | Required | Description      |
447 | |:--------------|:----------|:---------|:-----------------|
448 | | subscriber_id | Number    | Yes      | Subscriber's ID. |
449 | 
450 | ##### Example Request
451 | 
452 | ```shell
453 | curl -u 'api_username:access_token' -X PUT 'http://localhost:9000/api/subscribers/9/blocklist'
454 | ```
455 | 
456 | ##### Example Response
457 | 
458 | ```json
459 | {
460 |     "data": true
461 | } 
462 | ```
463 | 
464 | ______________________________________________________________________
465 | 
466 | #### PUT /api/subscribers/blocklist
467 | 
468 | Blocklist multiple subscriber.
469 | 
470 | ##### Parameters
471 | 
472 | | Name          | Type      | Required | Description      |
473 | |:--------------|:----------|:---------|:-----------------|
474 | | ids           | Number    | Yes      | Subscriber's ID. |
475 | 
476 | ##### Example Request
477 | 
478 | ```shell
479 | curl -u 'api_username:access_token' -X PUT 'http://localhost:8080/api/subscribers/blocklist' -H 'Content-Type: application/json' --data-raw '{"ids":[2,1]}'
480 | ```
481 | 
482 | ##### Example Response
483 | 
484 | ```json
485 | {
486 |     "data": true
487 | } 
488 | ```
489 | 
490 | ______________________________________________________________________
491 | 
492 | #### PUT /api/subscribers/query/blocklist
493 | 
494 | Blocklist subscribers based on SQL expression.
495 | 
496 | > Refer to the [querying and segmentation](../querying-and-segmentation.md#querying-and-segmenting-subscribers) section for more information on how to query subscribers with SQL expressions.
497 | 
498 | ##### Parameters
499 | 
500 | | Name     | Type     | Required | Description                                 |
501 | |:---------|:---------|:---------|:--------------------------------------------|
502 | | query    | string   | Yes      | SQL expression to filter subscribers with.  |
503 | | list_ids | []number | No       | Optional list IDs to limit the filtering to.|
504 | 
505 | ##### Example Request
506 | 
507 | ```shell
508 | curl -u 'api_username:access_token' -X POST 'http://localhost:9000/api/subscribers/query/blocklist' \
509 | -H 'Content-Type: application/json' \
510 | --data-raw '{"query":"subscribers.name LIKE \'John Doe\' AND subscribers.attribs->>'\''city'\'' = '\''Bengaluru'\''"}'
511 | ```
512 | 
513 | ##### Example Response
514 | 
515 | ```json
516 | {
517 |     "data": true
518 | }
519 | ```
520 | 
521 | ______________________________________________________________________
522 | 
523 | #### DELETE /api/subscribers/{subscriber_id}
524 | 
525 | Delete a specific subscriber.
526 | 
527 | ##### Parameters
528 | 
529 | | Name          | Type      | Required | Description      |
530 | |:--------------|:----------|:---------|:-----------------|
531 | | subscriber_id | Number    | Yes      | Subscriber's ID. |
532 | 
533 | ##### Example Request
534 | 
535 | ```shell
536 | curl -u 'api_username:access_token' -X DELETE 'http://localhost:9000/api/subscribers/9'
537 | ```
538 | 
539 | ##### Example Response
540 | 
541 | ```json
542 | {
543 |     "data": true
544 | }
545 | ```
546 | 
547 | ______________________________________________________________________
548 | 
549 | #### DELETE /api/subscribers/{subscriber_id}/bounces
550 | 
551 | Delete a subscriber's bounce records
552 | 
553 | ##### Parameters
554 | 
555 | | Name | Type          | Required | Description                |
556 | |:-----|:--------------|:---------|:---------------------------|
557 | | id   | subscriber_id | Yes      | Subscriber's ID.           |
558 | 
559 | ##### Example Request
560 | 
561 | ```shell
562 | curl -u 'api_username:access_token' -X DELETE 'http://localhost:9000/api/subscribers/9/bounces'
563 | ```
564 | 
565 | ##### Example Response
566 | 
567 | ```json
568 | {
569 |     "data": true
570 | }
571 | ```
572 | 
573 | ______________________________________________________________________
574 | 
575 | #### DELETE /api/subscribers
576 | 
577 | Delete one or more subscribers.
578 | 
579 | ##### Parameters
580 | 
581 | | Name | Type      | Required | Description                |
582 | |:-----|:----------|:---------|:---------------------------|
583 | | id   | number\[\]  | Yes      | Array of subscriber's IDs. |
584 | 
585 | ##### Example Request
586 | 
587 | ```shell
588 | curl -u 'api_username:access_token' -X DELETE 'http://localhost:9000/api/subscribers?id=10&id=11'
589 | ```
590 | 
591 | ##### Example Response
592 | 
593 | ```json
594 | {
595 |     "data": true
596 | }
597 | ```
598 | 
599 | ______________________________________________________________________
600 | 
601 | #### POST /api/subscribers/query/delete
602 | 
603 | Delete subscribers based on SQL expression.
604 | 
605 | ##### Parameters
606 | 
607 | | Name     | Type     | Required | Description                                 |
608 | |:---------|:---------|:---------|:--------------------------------------------|
609 | | query    | string   | Yes      | SQL expression to filter subscribers with.  |
610 | | list_ids | []number | No       | Optional list IDs to limit the filtering to.|
611 | 
612 | 
613 | ##### Example Request
614 | 
615 | ```shell
616 | curl -u 'api_username:access_token' -X POST 'http://localhost:9000/api/subscribers/query/delete' \
617 | -H 'Content-Type: application/json' \
618 | --data-raw '{"query":"subscribers.name LIKE \'John Doe\' AND subscribers.attribs->>'\''city'\'' = '\''Bengaluru'\''"}'
619 | ```
620 | 
621 | ##### Example Response
622 | 
623 | ```json
624 | {
625 |     "data": true
626 | }
627 | ```
628 | 


--------------------------------------------------------------------------------
/docs/docs/content/apis/templates.md:
--------------------------------------------------------------------------------
  1 | # API / Templates
  2 | 
  3 | | Method | Endpoint                                                                      | Description                    |
  4 | |:-------|:------------------------------------------------------------------------------|:-------------------------------|
  5 | | GET    | [/api/templates](#get-apitemplates)                                           | Retrieve all templates         |
  6 | | GET    | [/api/templates/{template_id}](#get-apitemplates-template_id)                 | Retrieve a template            |
  7 | | GET    | [/api/templates/{template_id}/preview](#get-apitemplates-template_id-preview) | Retrieve template HTML preview |
  8 | | POST   | [/api/templates](#post-apitemplates)                                          | Create a template              |
  9 | | POST   | /api/templates/preview                                                        | Render and preview a template  |
 10 | | PUT    | [/api/templates/{template_id}](#put-apitemplatestemplate_id)                  | Update a template              |
 11 | | PUT    | [/api/templates/{template_id}/default](#put-apitemplates-template_id-default) | Set default template           |
 12 | | DELETE | [/api/templates/{template_id}](#delete-apitemplates-template_id)              | Delete a template              |
 13 | 
 14 | ______________________________________________________________________
 15 | 
 16 | #### GET /api/templates
 17 | 
 18 | Retrieve all templates.
 19 | 
 20 | ##### Example Request
 21 | 
 22 | ```shell
 23 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/templates'
 24 | ```
 25 | 
 26 | ##### Example Response
 27 | 
 28 | ```json
 29 | {
 30 |     "data": [
 31 |         {
 32 |             "id": 1,
 33 |             "created_at": "2020-03-14T17:36:41.288578+01:00",
 34 |             "updated_at": "2020-03-14T17:36:41.288578+01:00",
 35 |             "name": "Default template",
 36 |             "body": "{{ template \"content\" . }}",
 37 |             "type": "campaign",
 38 |             "is_default": true
 39 |         }
 40 |     ]
 41 | }
 42 | ```
 43 | 
 44 | ______________________________________________________________________
 45 | 
 46 | #### GET /api/templates/{template_id}
 47 | 
 48 | Retrieve a specific template.
 49 | 
 50 | ##### Parameters
 51 | 
 52 | | Name        | Type      | Required | Description                    |
 53 | |:------------|:----------|:---------|:-------------------------------|
 54 | | template_id | number    | Yes      | ID of the template to retrieve |
 55 | 
 56 | ##### Example Request
 57 | 
 58 | ```shell
 59 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/templates/1'
 60 | ```
 61 | 
 62 | ##### Example Response
 63 | 
 64 | ```json
 65 | {
 66 |     "data": {
 67 |         "id": 1,
 68 |         "created_at": "2020-03-14T17:36:41.288578+01:00",
 69 |         "updated_at": "2020-03-14T17:36:41.288578+01:00",
 70 |         "name": "Default template",
 71 |         "body": "{{ template \"content\" . }}",
 72 |         "type": "campaign",
 73 |         "is_default": true
 74 |     }
 75 | }
 76 | ```
 77 | 
 78 | ______________________________________________________________________
 79 | 
 80 | #### GET /api/templates/{template_id}/preview
 81 | 
 82 | Retrieve the HTML preview of a template.
 83 | 
 84 | ##### Parameters
 85 | 
 86 | | Name        | Type      | Required | Description                   |
 87 | |:------------|:----------|:---------|:------------------------------|
 88 | | template_id | number    | Yes      | ID of the template to preview |
 89 | 
 90 | ##### Example Request
 91 | 
 92 | ```shell
 93 | curl -u "api_user:token" -X GET 'http://localhost:9000/api/templates/1/preview'
 94 | ```
 95 | 
 96 | ##### Example Response
 97 | 
 98 | ```html
 99 | <p>Hi there</p>
100 | <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et elit ac elit sollicitudin condimentum non a magna.
101 | 	Sed tempor mauris in facilisis vehicula. Aenean nisl urna, accumsan ac tincidunt vitae, interdum cursus massa.
102 | 	Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam varius turpis et turpis lacinia placerat.
103 | 	Aenean id ligula a orci lacinia blandit at eu felis. Phasellus vel lobortis lacus. Suspendisse leo elit, luctus sed
104 | 	erat ut, venenatis fermentum ipsum. Donec bibendum neque quis.</p>
105 | 
106 | <h3>Sub heading</h3>
107 | <p>Nam luctus dui non placerat mattis. Morbi non accumsan orci, vel interdum urna. Duis faucibus id nunc ut euismod.
108 | 	Curabitur et eros id erat feugiat fringilla in eget neque. Aliquam accumsan cursus eros sed faucibus.</p>
109 | 
110 | <p>Here is a link to <a href="https://listmonk.app" target="_blank">listmonk</a>.</p>
111 | ```
112 | 
113 | ______________________________________________________________________
114 | 
115 | #### POST /api/templates
116 | 
117 | Create a template.
118 | 
119 | ##### Parameters
120 | 
121 | | Name    | Type      | Required | Description                                   |
122 | |:--------|:----------|:---------|:----------------------------------------------|
123 | | name    | string    | Yes      | Name of the template                          |
124 | | type    | string    | Yes      | Type of the template (`campaign` or `tx`)     |
125 | | subject | string    |          | Subject line for the template (only for `tx`) |
126 | | body    | string    | Yes      | HTML body of the template                     |
127 | 
128 | ##### Example Request
129 | 
130 | ```shell
131 | curl -u "api_user:token" -X POST 'http://localhost:9000/api/templates' \
132 | -H 'Content-Type: application/json' \
133 | -d '{
134 |     "name": "New template",
135 |     "type": "campaign",
136 |     "subject": "Your Weekly Newsletter",
137 |     "body": "<h1>Header</h1><p>Content goes here</p>"
138 | }'
139 | ```
140 | 
141 | ##### Example Response
142 | 
143 | ```json
144 | {
145 |     "data": [
146 |         {
147 |             "id": 1,
148 |             "created_at": "2020-03-14T17:36:41.288578+01:00",
149 |             "updated_at": "2020-03-14T17:36:41.288578+01:00",
150 |             "name": "Default template",
151 |             "body": "{{ template \"content\" . }}",
152 |             "type": "campaign",
153 |             "is_default": true
154 |         }
155 |     ]
156 | }
157 | ```
158 | 
159 | ______________________________________________________________________
160 | 
161 | #### PUT /api/templates/{template_id}
162 | 
163 | Update a template.
164 | 
165 | > Refer to parameters from [POST /api/templates](#post-apitemplates)
166 | 
167 | ______________________________________________________________________
168 | 
169 | #### PUT /api/templates/{template_id}/default
170 | 
171 | Set a template as the default.
172 | 
173 | ##### Parameters
174 | 
175 | | Name        | Type      | Required | Description                          |
176 | |:------------|:----------|:---------|:-------------------------------------|
177 | | template_id | number    | Yes      | ID of the template to set as default |
178 | 
179 | ##### Example Request
180 | 
181 | ```shell
182 | curl -u "api_user:token" -X PUT 'http://localhost:9000/api/templates/1/default'
183 | ```
184 | 
185 | ##### Example Response
186 | 
187 | ```json
188 | {
189 |     "data": {
190 |         "id": 1,
191 |         "created_at": "2020-03-14T17:36:41.288578+01:00",
192 |         "updated_at": "2020-03-14T17:36:41.288578+01:00",
193 |         "name": "Default template",
194 |         "body": "{{ template \"content\" . }}",
195 |         "type": "campaign",
196 |         "is_default": true
197 |     }
198 | }
199 | ```
200 | 
201 | ______________________________________________________________________
202 | 
203 | #### DELETE /api/templates/{template_id}
204 | 
205 | Delete a template.
206 | 
207 | ##### Parameters
208 | 
209 | | Name        | Type      | Required | Description                  |
210 | |:------------|:----------|:---------|:-----------------------------|
211 | | template_id | number    | Yes      | ID of the template to delete |
212 | 
213 | ##### Example Request
214 | 
215 | ```shell
216 | curl -u "api_user:token" -X DELETE 'http://localhost:9000/api/templates/35'
217 | ```
218 | 
219 | ##### Example Response
220 | 
221 | ```json
222 | {
223 |     "data": true
224 | }
225 | ```
226 | 


--------------------------------------------------------------------------------
/docs/docs/content/apis/transactional.md:
--------------------------------------------------------------------------------
 1 | # API / Transactional
 2 | 
 3 | | Method | Endpoint | Description                    |
 4 | |:-------|:---------|:-------------------------------|
 5 | | POST   | /api/tx  | Send transactional messages    |
 6 | 
 7 | ______________________________________________________________________
 8 | 
 9 | #### POST /api/tx
10 | 
11 | Allows sending transactional messages to one or more subscribers via a preconfigured transactional template.
12 | 
13 | ##### Parameters
14 | 
15 | | Name              | Type      | Required | Description                                                                |
16 | |:------------------|:----------|:---------|:---------------------------------------------------------------------------|
17 | | subscriber_email  | string    |          | Email of the subscriber. Can substitute with `subscriber_id`.              |
18 | | subscriber_id     | number    |          | Subscriber's ID can substitute with `subscriber_email`.                    |
19 | | subscriber_emails | string\[\]  |          | Multiple subscriber emails as alternative to `subscriber_email`.           |
20 | | subscriber_ids    | number\[\]  |          | Multiple subscriber IDs as an alternative to `subscriber_id`.              |
21 | | template_id       | number    | Yes      | ID of the transactional template to be used for the message.               |
22 | | from_email        | string    |          | Optional sender email.                                                     |
23 | | data              | JSON      |          | Optional nested JSON map. Available in the template as `{{ .Tx.Data.* }}`. |
24 | | headers           | JSON\[\]    |          | Optional array of email headers.                                           |
25 | | messenger         | string    |          | Messenger to send the message. Default is `email`.                         |
26 | | content_type      | string    |          | Email format options include `html`, `markdown`, and `plain`.              |
27 | 
28 | ##### Example
29 | 
30 | ```shell
31 | curl -u "api_user:token" "http://localhost:9000/api/tx" -X POST \
32 |      -H 'Content-Type: application/json; charset=utf-8' \
33 |      --data-binary @- << EOF
34 |     {
35 |         "subscriber_email": "user@test.com",
36 |         "template_id": 2,
37 |         "data": {"order_id": "1234", "date": "2022-07-30", "items": [1, 2, 3]},
38 |         "content_type": "html"
39 |     }
40 | EOF
41 | ```
42 | 
43 | ##### Example response
44 | 
45 | ```json
46 | {
47 |     "data": true
48 | }
49 | ```
50 | 
51 | ______________________________________________________________________
52 | 
53 | #### File Attachments
54 | 
55 | To include file attachments in a transactional message, use the `multipart/form-data` Content-Type. Use `data` param for the parameters described above as a JSON object. Include any number of attachments via the `file` param.
56 | 
57 | ```shell
58 | curl -u "api_user:token" "http://localhost:9000/api/tx" -X POST \
59 | -F 'data=\"{
60 |     \"subscriber_email\": \"user@test.com\",
61 |     \"template_id\": 4
62 | }"' \
63 | -F 'file=@"/path/to/attachment.pdf"' \
64 | -F 'file=@"/path/to/attachment2.pdf"'
65 | ```
66 | 


--------------------------------------------------------------------------------
/docs/docs/content/archives.md:
--------------------------------------------------------------------------------
 1 | # Archives
 2 | 
 3 | A global public archive is maintained on the public web interface. It can be
 4 | enabled under Settings -> Settings -> General -> Enable public mailing list
 5 | archive.
 6 | 
 7 | To make a campaign available in the public archive (provided it has been
 8 | enabled in the settings as described above), enable the option
 9 | 'Publish to public archive' under Campaigns -> Create new -> Archive.
10 | 
11 | When using template variables that depend on subscriber data (such as any
12 | template variable referencing `.Subscriber`), such data must be supplied
13 | as 'Campaign metadata', which is a JSON object that will be used in place
14 | of `.Subscriber` when rendering the archive template and content.
15 | 
16 | When individual subscriber tracking is enabled, TrackLink requires that a UUID
17 | of an existing user is provided as part of the campaign metadata. Any clicks on
18 | a TrackLink from the archived campaign will be counted towards that subscriber.
19 | 
20 | As an example:
21 | 
22 | ```json
23 | {
24 |   "UUID": "5a837423-a186-5623-9a87-82691cbe3631",
25 |   "email": "example@example.com",
26 |   "name": "Reader",
27 |   "attribs": {}
28 | }
29 | ```
30 | 
31 | ![Archive campaign](images/archived-campaign-metadata.png)
32 | 
33 | 


--------------------------------------------------------------------------------
/docs/docs/content/bounces.md:
--------------------------------------------------------------------------------
  1 | # Bounce processing
  2 | 
  3 | Enable bounce processing in Settings -> Bounces. POP3 bounce scanning and APIs only become available once the setting is enabled.
  4 | 
  5 | ## POP3 bounce mailbox
  6 | Configure the bounce mailbox in Settings -> Bounces. Either the "From" e-mail that is set on a campaign (or in settings) should have a POP3 mailbox behind it to receive bounce e-mails, or you should configure a dedicated POP3 mailbox and add that address as the `Return-Path` (envelope sender) header in Settings -> SMTP -> Custom headers box. For example:
  7 | 
  8 | ```
  9 | [
 10 | 	{"Return-Path": "your-bounce-inbox@site.com"}
 11 | ]
 12 | 
 13 | ```
 14 | 
 15 | Some mail servers may also return the bounce to the `Reply-To` address, which can also be added to the header settings.
 16 | 
 17 | ## Webhook API
 18 | The bounce webhook API can be used to record bounce events with custom scripting. This could be by reading a mailbox, a database, or mail server logs.
 19 | 
 20 | | Method | Endpoint         | Description            |
 21 | | ------ | ---------------- | ---------------------- |
 22 | | `POST` | /webhooks/bounce | Record a bounce event. |
 23 | 
 24 | 
 25 | | Name            | Type      | Required   | Description                                                                          |
 26 | | ----------------| --------- | -----------| ------------------------------------------------------------------------------------ |
 27 | | subscriber_uuid | string    |            | The UUID of the subscriber. Either this or `email` is required.                      |
 28 | | email           | string    |            | The e-mail of the subscriber. Either this or `subscriber_uuid` is required.          |
 29 | | campaign_uuid   | string    |            | UUID of the campaign for which the bounce happened.                                  |
 30 | | source          | string    | Yes        | A string indicating the source, eg: `api`, `my_script` etc.                          |
 31 | | type            | string    | Yes        | `hard` or `soft` bounce. Currently, this has no effect on how the bounce is treated. |
 32 | | meta            | string    |            | An optional escaped JSON string with arbitrary metadata about the bounce event.      |
 33 |  
 34 | 
 35 | ```shell
 36 | curl -u 'api_username:access_token' -X POST 'http://localhost:9000/webhooks/bounce' \
 37 | 	-H "Content-Type: application/json" \
 38 | 	--data '{"email": "user1@mail.com", "campaign_uuid": "9f86b50d-5711-41c8-ab03-bc91c43d711b", "source": "api", "type": "hard", "meta": "{\"additional\": \"info\"}}'
 39 | 
 40 | ```
 41 | 
 42 | ## External webhooks
 43 | listmonk supports receiving bounce webhook events from the following SMTP providers.
 44 | 
 45 | | Endpoint                                                      | Description                            | More info                                                                                                             |
 46 | |:--------------------------------------------------------------|:---------------------------------------|:----------------------------------------------------------------------------------------------------------------------|
 47 | | `https://listmonk.yoursite.com/webhooks/service/ses`          | Amazon (AWS) SES                       | See below                                                                                                             |
 48 | | `https://listmonk.yoursite.com/webhooks/service/sendgrid`     | Sendgrid / Twilio Signed event webhook | [More info](https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features) |
 49 | | `https://listmonk.yoursite.com/webhooks/service/postmark`     | Postmark webhook                       | [More info](https://postmarkapp.com/developer/webhooks/webhooks-overview)                                             |
 50 | | `https://listmonk.yoursite.com/webhooks/service/forwardemail` | Forward Email webhook                   | [More info](https://forwardemail.net/en/faq#do-you-support-bounce-webhooks)                                                  |
 51 | 
 52 | ## Amazon Simple Email Service (SES)
 53 | 
 54 | If using SES as your SMTP provider, automatic bounce processing is the recommended way to maintain your [sender reputation](https://docs.aws.amazon.com/ses/latest/dg/monitor-sender-reputation.html). The settings below are based on Amazon's [recommendations](https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-deliverability.html). Please note that your sending domain must be verified in SES before proceeding.
 55 | 
 56 | 1. In listmonk settings, go to the "Bounces" tab and configure the following:
 57 |     - Enable bounce processing: `Enabled`
 58 |         - Soft:
 59 |             - Bounce count: `2`
 60 |             - Action: `None`
 61 |         - Hard:
 62 |             - Bounce count: `1`
 63 |             - Action: `Blocklist`
 64 |         - Complaint: 
 65 |             - Bounce count: `1`
 66 |             - Action: `Blocklist`
 67 |     - Enable bounce webhooks: `Enabled`
 68 |     - Enable SES: `Enabled`
 69 | 2. In the AWS console, go to [Simple Notification Service](https://console.aws.amazon.com/sns/) and create a new topic with the following settings:
 70 |     - Type: `Standard`
 71 |     - Name: `ses-bounces` (or any other name)
 72 | 3. Create a new subscription to that topic with the following settings:
 73 |     - Protocol: `HTTPS`
 74 |     - Endpoint: `https://listmonk.yoursite.com/webhooks/service/ses`
 75 |     - Enable raw message delivery: `Disabled` (unchecked)
 76 | 4. SES will then make a request to your listmonk instance to confirm the subscription. After a page refresh, the subscription should have a status of "Confirmed". If not, your endpoint may be incorrect or not publicly accessible.
 77 | 5. In the AWS console, go to [Simple Email Service](https://console.aws.amazon.com/ses/) and click "Verified identities" in the left sidebar.
 78 | 6. Click your domain and go to the "Notifications" tab.
 79 | 7. Next to "Feedback notifications", click "Edit".
 80 | 8. For both "Bounce feedback" and "Complaint feedback", use the following settings:
 81 |     - SNS topic: `ses-bounces` (or whatever you named it)
 82 |     - Include original email headers: `Enabled` (checked)
 83 | 9. Repeat steps 6-8 for any `Email address` identities you send from using listmonk
 84 | 10. Bounce processing should now be working. You can test it with [SES simulator addresses](https://docs.aws.amazon.com/ses/latest/dg/send-an-email-from-console.html#send-email-simulator). Add them as subscribers, send them campaign previews, and ensure that the appropriate action was taken after the configured bounce count was reached.
 85 |     - Soft bounce: `ooto@simulator.amazonses.com`
 86 |     - Hard bounce: `bounce@simulator.amazonses.com`
 87 |     - Complaint: `complaint@simulator.amazonses.com`
 88 | 11. You can optionally [disable email feedback forwarding](https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity-using-notifications-email.html#monitor-sending-activity-using-notifications-email-disabling).
 89 | 
 90 | ## Exporting bounces
 91 | 
 92 | Bounces can be exported via the JSON API:
 93 | ```shell
 94 | curl -u 'username:passsword' 'http://localhost:9000/api/bounces'
 95 | ```
 96 | 
 97 | Or by querying the database directly:
 98 | ```sql
 99 | SELECT bounces.created_at,
100 |     bounces.subscriber_id,
101 |     subscribers.uuid AS subscriber_uuid,
102 |     subscribers.email AS email
103 | FROM bounces
104 | LEFT JOIN subscribers ON (subscribers.id = bounces.subscriber_id)
105 | ORDER BY bounces.created_at DESC LIMIT 1000;
106 | ```
107 | 


--------------------------------------------------------------------------------
/docs/docs/content/concepts.md:
--------------------------------------------------------------------------------
 1 | # Concepts
 2 | 
 3 | ## Subscriber
 4 | 
 5 | A subscriber is a recipient identified by an e-mail address and name. Subscribers receive e-mails that are sent from listmonk. A subscriber can be added to any number of lists. Subscribers who are not a part of any lists are considered *orphan* records.
 6 | 
 7 | ### Attributes
 8 | 
 9 | Attributes are arbitrary properties attached to a subscriber in addition to their e-mail and name. They are represented as a JSON map. It is not necessary for all subscribers to have the same attributes. Subscribers can be [queried and segmented](querying-and-segmentation.md) into lists based on their attributes, and the attributes can be inserted into the e-mails sent to them. For example:
10 | 
11 | ```json
12 | {
13 |   "city": "Bengaluru",
14 |   "likes_tea": true,
15 |   "spoken_languages": ["English", "Malayalam"],
16 |   "projects": 3,
17 |   "stack": {
18 |     "frameworks": ["echo", "go"],
19 |     "languages": ["go", "python"],
20 |     "preferred_language": "go"
21 |   }
22 | }
23 | ```
24 | 
25 | ### Subscription statuses
26 | 
27 | A subscriber can be added to one or more lists, and each such relationship can have one of these statuses.
28 | 
29 | | Status        | Description                                                                       |
30 | | ------------- | --------------------------------------------------------------------------------- |
31 | | `unconfirmed` | The subscriber was added to the list directly without their explicit confirmation. Nonetheless, the subscriber will receive campaign messages sent to single optin campaigns. |
32 | | `confirmed`   | The subscriber confirmed their subscription by clicking on 'accept' in the confirmation e-mail. Only confirmed subscribers in opt-in lists will receive campaign messages send to the list.                                       |
33 | | `unsubscribed` | The subscriber is unsubscribed from the list and will not receive any campaign messages sent to the list.
34 | 
35 | 
36 | ### Segmentation
37 | 
38 | Segmentation is the process of filtering a large list of subscribers into a smaller group based on arbitrary conditions, primarily based on their attributes. For instance, if an e-mail needs to be sent subscribers who live in a particular city, given their city is described in their attributes, it's possible to quickly filter them out into a new list and e-mail them. [Learn more](querying-and-segmentation.md).
39 | 
40 | ## List
41 | 
42 | A list (or a _mailing list_) is a collection of subscribers grouped under a name, for instance, _clients_. Lists are used to organise subscribers and send e-mails to specific groups. A list can be single optin or double optin. Subscribers added to double optin lists have to explicitly accept the subscription by clicking on the confirmation e-mail they receive. Until then, they do not receive campaign messages.
43 | 
44 | ## Campaign
45 | 
46 | A campaign is an e-mail (or any other kind of messages) that is sent to one or more lists.
47 | 
48 | 
49 | ## Transactional message
50 | 
51 | A transactional message is an arbitrary message sent to a subscriber using the transactional message API. For example a welcome e-mail on signing up to a service; an order confirmation e-mail on purchasing an item; a password reset e-mail when a user initiates an online account recovery process.
52 | 
53 | 
54 | ## Template
55 | 
56 | A template is a re-usable HTML design that can be used across campaigns and when sending arbitrary transactional messages. Most commonly, templates have standard header and footer areas with logos and branding elements, where campaign content is inserted in the middle. listmonk supports [Go template](https://gowebexamples.com/templates/) expressions that lets you create powerful, dynamic HTML templates. [Learn more](templating.md).
57 | 
58 | ## Messenger
59 | 
60 | listmonk supports multiple custom messaging backends in additional to the default SMTP e-mail backend, enabling not just e-mail campaigns, but arbitrary message campaigns such as SMS, FCM notifications etc. A *Messenger* is a web service that accepts a campaign message pushed to it as a JSON request, which the service can in turn broadcast as SMS, FCM etc. [Learn more](messengers.md).
61 | 
62 | ## Tracking pixel
63 | 
64 | The tracking pixel is a tiny, invisible image that is inserted into an e-mail body to track e-mail views. This allows measuring the read rate of e-mails. While this is exceedingly common in e-mail campaigns, it carries privacy implications and should be used in compliance with rules and regulations such as GDPR. It is possible to track reads anonymously without associating an e-mail read to a subscriber.
65 | 
66 | ## Click tracking
67 | 
68 | It is possible to track the clicks on every link that is sent in an e-mail. This allows measuring the clickthrough rates of links in e-mails. While this is exceedingly common in e-mail campaigns, it carries privacy implications and should be used in compliance with rules and regulations such as GDPR. It is possible to track link clicks anonymously without associating an e-mail read to a subscriber.
69 | 
70 | ## Bounce
71 | 
72 | A bounce occurs when an e-mail that is sent to a recipient "bounces" back for one of many reasons including the recipient address being invalid, their mailbox being full, or the recipient's e-mail service provider marking the e-mail as spam. listmonk can automatically process such bounce e-mails that land in a configured POP mailbox, or via APIs of SMTP e-mail providers such as AWS SES and Sengrid. Based on settings, subscribers returning bounced e-mails can either be blocklisted or deleted automatically. [Learn more](bounces.md).
73 | 


--------------------------------------------------------------------------------
/docs/docs/content/configuration.md:
--------------------------------------------------------------------------------
  1 | # Configuration
  2 | 
  3 | ### TOML Configuration file
  4 | One or more TOML files can be read by passing `--config config.toml` multiple times. Apart from a few low level configuration variables and the database configuration, all other settings can be managed from the `Settings` dashboard on the admin UI.
  5 | 
  6 | To generate a new sample configuration file, run `--listmonk --new-config`
  7 | 
  8 | ### Environment variables
  9 | Variables in config.toml can also be provided as environment variables prefixed by `LISTMONK_` with periods replaced by `__` (double underscore). To start listmonk purely with environment variables without a configuration file, set the environment variables and pass the config flag as `--config=""`.
 10 | 
 11 | Example:
 12 | 
 13 | | **Environment variable**       | Example value  |
 14 | | ------------------------------ | -------------- |
 15 | | `LISTMONK_app__address`        | "0.0.0.0:9000" |
 16 | | `LISTMONK_db__host`            | db             |
 17 | | `LISTMONK_db__port`            | 9432           |
 18 | | `LISTMONK_db__user`            | listmonk       |
 19 | | `LISTMONK_db__password`        | listmonk       |
 20 | | `LISTMONK_db__database`        | listmonk       |
 21 | | `LISTMONK_db__ssl_mode`        | disable        |
 22 | 
 23 | 
 24 | ### Customizing system templates
 25 | See [system templates](templating.md#system-templates).
 26 | 
 27 | 
 28 | ### HTTP routes
 29 | When configuring auth proxies and web application firewalls, use this table.
 30 | 
 31 | #### Private admin endpoints.
 32 | 
 33 | | Methods | Route              | Description             |
 34 | | ------- | ------------------ | ----------------------- |
 35 | | `*`     | `/api/*`           | Admin APIs              |
 36 | | `GET`   | `/admin/*`         | Admin UI and HTML pages |
 37 | | `POST`  | `/webhooks/bounce` | Admin bounce webhook    |
 38 | 
 39 | 
 40 | #### Public endpoints to expose to the internet.
 41 | 
 42 | | Methods     | Route                 | Description                                   |
 43 | | ----------- | --------------------- | --------------------------------------------- |
 44 | | `GET, POST` | `/subscription/*`     | HTML subscription pages                       |
 45 | | `GET, `     | `/link/*`             | Tracked link redirection                      |
 46 | | `GET`       | `/campaign/*`         | Pixel tracking image                          |
 47 | | `GET`       | `/public/*`           | Static files for HTML subscription pages      |
 48 | | `POST`      | `/webhooks/service/*` | Bounce webhook endpoints for AWS and Sendgrid |
 49 | | `GET`       | `/uploads/*`          | The file upload path configured in media settings |
 50 | 
 51 | 
 52 | ## Media uploads
 53 | 
 54 | #### Using filesystem
 55 | 
 56 | When configuring `docker` volume mounts for using filesystem media uploads, you can follow either of two approaches. [The second option may be necessary if](https://github.com/knadh/listmonk/issues/1169#issuecomment-1674475945) your setup requires you to use `sudo` for docker commands. 
 57 | 
 58 | After making any changes you will need to run `sudo docker compose stop ; sudo docker compose up`. 
 59 | 
 60 | And under `https://listmonk.mysite.com/admin/settings` you put `/listmonk/uploads`. 
 61 | 
 62 | #### Using volumes
 63 | 
 64 | Using `docker volumes`, you can specify the name of volume and destination for the files to be uploaded inside the container.
 65 | 
 66 | 
 67 | ```yml
 68 | app:
 69 |     volumes:
 70 |       - type: volume
 71 |         source: listmonk-uploads
 72 |         target: /listmonk/uploads
 73 | 
 74 | volumes:
 75 |   listmonk-uploads:
 76 | ```
 77 | 
 78 | !!! note
 79 | 
 80 |     This volume is managed by `docker` itself, and you can see find the host path with `docker volume inspect listmonk_listmonk-uploads`.
 81 | 
 82 | #### Using bind mounts
 83 | 
 84 | ```yml
 85 |   app:
 86 |     volumes:
 87 |       - ./path/on/your/host/:/path/inside/container
 88 | ```
 89 | Eg:
 90 | ```yml
 91 |   app:
 92 |     volumes:
 93 |       - ./data/uploads:/listmonk/uploads
 94 | ```
 95 | The files will be available inside `/data/uploads` directory on the host machine.
 96 | 
 97 | To use the default `uploads` folder:
 98 | ```yml
 99 |   app:
100 |     volumes:
101 |       - ./uploads:/listmonk/uploads
102 | ```
103 | 
104 | ## Logs
105 | 
106 | ### Docker
107 | 
108 | https://docs.docker.com/engine/reference/commandline/logs/
109 | ```
110 | sudo docker logs -f
111 | sudo docker logs listmonk_app -t
112 | sudo docker logs listmonk_db -t
113 | sudo docker logs --help
114 | ```
115 | Container info: `sudo docker inspect listmonk_listmonk`
116 | 
117 | Docker logs to `/dev/stdout` and `/dev/stderr`. The logs are collected by the docker daemon and stored in your node's host path (by default). The same can be configured (/etc/docker/daemon.json) in your docker daemon settings to setup other logging drivers, logrotate policy and more, which you can read about [here](https://docs.docker.com/config/containers/logging/configure/).
118 | 
119 | ### Binary
120 | 
121 | listmonk logs to `stdout`, which is usually not saved to any file. To save listmonk logs to a file use `./listmonk > listmonk.log`.
122 | 
123 | Settings -> Logs in admin shows the last 1000 lines of the standard log output but gets erased when listmonk is restarted.
124 | 
125 | For the [service file](https://github.com/knadh/listmonk/blob/master/listmonk%40.service), you can use `ExecStart=/bin/bash -ce "exec /usr/bin/listmonk --config /etc/listmonk/config.toml --static-dir /etc/listmonk/static >>/etc/listmonk/listmonk.log 2>&1"` to create a log file that persists after restarts. [More info](https://github.com/knadh/listmonk/issues/1462#issuecomment-1868501606).
126 | 
127 | 
128 | ## Time zone
129 | 
130 | To change listmonk's time zone (logs, etc.) edit `docker-compose.yml`:
131 | ```
132 | environment:
133 |     - TZ=Etc/UTC
134 | ```
135 | with any Timezone listed [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). Then run `sudo docker-compose stop ; sudo docker-compose up` after making changes.
136 | 
137 | ## SMTP
138 | 
139 | ### Retries
140 | The `Settings -> SMTP -> Retries` denotes the number of times a message that fails at the moment of sending is retried silently using different connections from the SMTP pool. The messages that fail even after retries are the ones that are logged as errors and ignored.
141 | 
142 | ## SMTP ports
143 | Some server hosts block outgoing SMTP ports (25, 465). You may have to contact your host to unblock them before being able to send e-mails. Eg: [Hetzner](https://docs.hetzner.com/cloud/servers/faq/#why-can-i-not-send-any-mails-from-my-server).
144 | 
145 | 
146 | ## Performance
147 | 
148 | ### Batch size
149 | 
150 | The batch size parameter is useful when working with very large lists with millions of subscribers for maximising throughput. It is the number of subscribers that are fetched from the database sequentially in a single cycle (~5 seconds) when a campaign is running. Increasing the batch size uses more memory, but reduces the round trip to the database.
151 | 


--------------------------------------------------------------------------------
/docs/docs/content/developer-setup.md:
--------------------------------------------------------------------------------
 1 | # Developer setup
 2 | The app has two distinct components, the Go backend and the VueJS frontend. In the dev environment, both are run independently.
 3 | 
 4 | 
 5 | ### Pre-requisites
 6 | - `go`
 7 | - `nodejs` (if you are working on the frontend) and `yarn`
 8 | - Postgres database. If there is no local installation, the demo docker DB can be used for development (`docker compose up demo-db`)
 9 | 
10 | 
11 | ### First time setup
12 | `git clone https://github.com/knadh/listmonk.git`. The project uses go.mod, so it's best to clone it outside the Go src path.
13 | 
14 | 1. Copy `config.toml.sample` as `config.toml` and add your config.
15 | 2. `make dist` to build the listmonk binary. Once the binary is built, run `./listmonk --install` to run the DB setup. For subsequent dev runs, use `make run`.
16 | 
17 | > [mailhog](https://github.com/mailhog/MailHog) is an excellent standalone mock SMTP server (with a UI) for testing and dev.
18 | 
19 | 
20 | ### Running the dev environment
21 | 1. Run `make run` to start the listmonk dev server on `:9000`.
22 | 2. Run `make run-frontend` to start the Vue frontend in dev mode using yarn on `:8080`. All `/api/*` calls are proxied to the app running on `:9000`. Refer to the [frontend README](https://github.com/knadh/listmonk/blob/master/frontend/README.md) for an overview on how the frontend is structured.
23 | 3. Visit `http://localhost:8080`
24 | 
25 | 
26 | # Production build
27 | Run `make dist` to build the Go binary, build the Javascript frontend, and embed the static assets producing a single self-contained binary, `listmonk`
28 | 


--------------------------------------------------------------------------------
/docs/docs/content/external-integration.md:
--------------------------------------------------------------------------------
 1 | # Integrating with external systems
 2 | 
 3 | In many environments, a mailing list manager's subscriber database is not run independently but as a part of an existing customer database or a CRM. There are multiple ways of keeping listmonk in sync with external systems.
 4 | 
 5 | ## Using APIs
 6 | 
 7 | The [subscriber APIs](apis/subscribers.md) offers several APIs to manipulate the subscribers database, like addition, updation, and deletion. For bulk synchronisation, a CSV can be generated (and optionally zipped) and posted to the import API.
 8 | 
 9 | ## Interacting directly with the DB
10 | 
11 | listmonk uses tables with simple schemas to represent subscribers (`subscribers`), lists (`lists`), and subscriptions (`subscriber_lists`). It is easy to add, update, and delete subscriber information directly with the database tables for advanced usecases. See the [table schemas](https://github.com/knadh/listmonk/blob/master/schema.sql) for more information.
12 | 


--------------------------------------------------------------------------------
/docs/docs/content/i18n.md:
--------------------------------------------------------------------------------
 1 | # Internationalization (i18n)
 2 | 
 3 | listmonk comes available in multiple languages thanks to language packs contributed by volunteers. A language pack is a JSON file with a map of keys and corresponding translations. The bundled languages can be [viewed here](https://github.com/knadh/listmonk/tree/master/i18n).
 4 | 
 5 | ## Additional language packs
 6 | These additional language packs can be downloaded and passed to listmonk with the `--i18n-dir` flag as described in the next section.
 7 | 
 8 | | Language         | Description                          |
 9 | |------------------|--------------------------------------|
10 | | [Deutsch (formal)](https://raw.githubusercontent.com/SvenPe/listmonk/4bbb2e5ebb2314b754cb2318f4f6683a0f854d43/i18n/de.json) | German language with formal pronouns |
11 | 
12 | 
13 | ## Customizing languages
14 | 
15 | To customize an existing language or to load a new language, put one or more `.json` language files in a directory, and pass the directory path to listmonk with the<br />`--i18n-dir=/path/to/dir` flag.
16 | 
17 | 
18 | ## Contributing a new language
19 | 
20 | ### Using the basic editor
21 | 
22 | - Visit [https://listmonk.app/i18n](https://listmonk.app/i18n)
23 | - Click on `Createa new language`, or to make changes to an existing language, use `Load language`.
24 | - Translate the text in the text fields on the UI.
25 | - Once done, use the `Download raw JSON` to download the language file.
26 | - Send a pull request to add the file to the [i18n directory on the GitHub repo](https://github.com/knadh/listmonk/tree/master/i18n). 
27 | 
28 | ### Using InLang (external service)
29 | 
30 | [![translation badge](https://inlang.com/badge?url=github.com/knadh/listmonk)](https://inlang.com/editor/github.com/knadh/listmonk?ref=badge)
31 | 
32 | - Visit [https://inlang.com/editor/github.com/knadh/listmonk](https://inlang.com/editor/github.com/knadh/listmonk)
33 | - To make changes and push them, you need to log in to GitHub using OAuth and fork the project from the UI.
34 | - Translate the text in the input fields on the UI. You can use the filters to see only the necessary translations.
35 | - Once you're done, push the changes from the UI and click on "Open a pull request." This will take you to GitHub, where you can write a PR message.
36 | 


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/images/2021-09-28_00-18.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/images/archived-campaign-metadata.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/images/edit-subscriber.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/images/favicon.png


--------------------------------------------------------------------------------
1 | <svg xmlns="http://www.w3.org/2000/svg" width="163.03" height="30.38" viewBox="0 0 43.135 8.038" xmlns:v="https://vecta.io/nano"><circle cx="4.019" cy="4.019" r="3.149" fill="none" stroke="#0055d4" stroke-width="1.74"/><path d="M11.457 7.303q-.566 0-.879-.322-.313-.331-.313-.932V.712L11.5.572v5.442q0 .305.253.305.139 0 .244-.052l.253.879q-.357.157-.792.157zm2.619-4.754v4.615H12.84V2.549zM13.449.172q.331 0 .54.209.218.2.218.514 0 .313-.218.522-.209.2-.54.2-.331 0-.54-.2-.209-.209-.209-.522 0-.313.209-.514.209-.209.54-.209zm3.319 2.238q.975 0 1.672.557l-.47.705q-.583-.366-1.149-.366-.305 0-.47.113-.165.113-.165.305 0 .139.07.235.078.096.279.183.209.087.618.209.731.2 1.088.54.357.331.357.914 0 .462-.27.801-.261.34-.714.522-.453.174-1.01.174-.583 0-1.062-.174-.479-.183-.819-.496l.61-.679q.583.453 1.237.453.348 0 .549-.131.209-.139.209-.374 0-.183-.078-.287-.078-.104-.287-.192-.209-.096-.653-.218-.697-.192-1.036-.54-.331-.357-.331-.879 0-.392.226-.705.226-.313.636-.488.418-.183.967-.183zm5.342 4.536q-.253.174-.575.261-.313.096-.627.096-.714-.009-1.08-.409-.366-.401-.366-1.176V3.42h-.688v-.871h.688v-1.01l1.237-.148v1.158h1.062l-.122.871h-.94v2.273q0 .331.113.479.113.148.348.148.235 0 .522-.157zm5.493-4.536q.549 0 .879.374.34.374.34 1.019v3.361h-1.237V4.012q0-.679-.453-.679-.244 0-.427.157-.183.157-.374.488v3.187h-1.237V4.012q0-.679-.453-.679-.244 0-.427.165-.183.157-.366.479v3.187h-1.237V2.549h1.071l.096.575q.261-.348.583-.531.331-.183.758-.183.392 0 .679.2.287.192.418.549.287-.374.618-.557.34-.192.766-.192zm4.148 0q1.036 0 1.62.653.583.644.583 1.794 0 .731-.27 1.289-.261.549-.766.853-.496.305-1.176.305-1.036 0-1.628-.644-.583-.653-.583-1.803 0-.731.261-1.28.27-.557.766-.862.505-.305 1.193-.305zm0 .923q-.47 0-.705.374-.226.366-.226 1.149 0 .784.226 1.158.235.366.697.366.462 0 .688-.366.235-.374.235-1.158 0-.784-.226-1.149-.226-.374-.688-.374zm5.271-.923q.61 0 .949.374.34.366.34 1.019v3.361h-1.237V4.012q0-.374-.131-.522-.122-.157-.374-.157-.261 0-.479.165-.209.157-.409.479v3.187h-1.237V2.549h1.071l.096.583q.287-.357.627-.54.348-.183.784-.183zM40.2.572v6.592h-1.237V.712zm2.804 1.977l-1.472 2.029 1.602 2.586h-1.402l-1.489-2.525 1.48-2.09z"/></svg>


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/images/query-subscribers.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/docs/content/images/splash.png


--------------------------------------------------------------------------------
/docs/docs/content/index.md:
--------------------------------------------------------------------------------
 1 | # Introduction
 2 | 
 3 | [![listmonk](images/logo.svg)](https://listmonk.app)
 4 | 
 5 | listmonk is a self-hosted, high performance one-way mailing list and newsletter manager. It comes as a standalone binary and the only dependency is a Postgres database.
 6 | 
 7 | [![listmonk screenshot](https://user-images.githubusercontent.com/547147/134939475-e0391111-f762-44cb-b056-6cb0857755e3.png)](https://listmonk.app)
 8 | 
 9 | ## Developers
10 | listmonk is a free and open source software licensed under AGPLv3. If you are interested in contributing, check out the [GitHub repository](https://github.com/knadh/listmonk) and refer to the [developer setup](developer-setup.md). The backend is written in Go and the frontend is Vue with Buefy for UI. 
11 | 


--------------------------------------------------------------------------------
/docs/docs/content/installation.md:
--------------------------------------------------------------------------------
  1 | # Installation
  2 | 
  3 | listmonk is a simple binary application that requires a Postgres database instance to run. The binary can be downloaded and run manually, or it can be run as a container with Docker compose.
  4 | 
  5 | ## Binary
  6 | 1. Download the [latest release](https://github.com/knadh/listmonk/releases) and extract the listmonk binary. `amd64` is the main one. It works for Intel and x86 CPUs.
  7 | 1. `./listmonk --new-config` to generate config.toml. Edit the file.
  8 | 1. `./listmonk --install` to install the tables in the Postgres DB (⩾ 12).
  9 | 1. Run `./listmonk` and visit `http://localhost:9000` to create the Super Admin user and login.
 10 | 
 11 | !!! Tip
 12 |     To set the Super Admin username and password during installation, set the environment variables:
 13 |     `LISTMONK_ADMIN_USER=myuser LISTMONK_ADMIN_PASSWORD=xxxxx ./listmonk --install`
 14 | 
 15 | 
 16 | ## Docker
 17 | 
 18 | The latest image is available on DockerHub at `listmonk/listmonk:latest`
 19 | 
 20 | The recommended method is to download the [docker-compose.yml](https://github.com/knadh/listmonk/blob/master/docker-compose.yml) file, customize it for your environment and then to simply run `docker compose up -d`.
 21 | 
 22 | ```shell
 23 | # Download the compose file to the current directory.
 24 | curl -LO https://github.com/knadh/listmonk/raw/master/docker-compose.yml
 25 | 
 26 | # Run the services in the background.
 27 | docker compose up -d
 28 | ```
 29 | 
 30 | Then, visit `http://localhost:9000` to create the Super Admin user and login.
 31 | 
 32 | !!! Tip
 33 |     To set the Super Admin username and password during setup, set the environment variables (only the first time):
 34 |     `LISTMONK_ADMIN_USER=myuser LISTMONK_ADMIN_PASSWORD=xxxxx docker compose up -d`
 35 | 
 36 | 
 37 | ------------
 38 | 
 39 | ### Mounting a custom config.toml
 40 | The docker-compose file includes all necessary listmonk configuration as environment variables, `LISTMONK_*`.
 41 | If you would like to remove those and mount a config.toml instead:
 42 | 
 43 | #### 1. Save the config.toml file on the host
 44 | 
 45 | ```toml
 46 | [app]
 47 | address = "0.0.0.0:9000"
 48 | 
 49 | # Database.
 50 | [db]
 51 | host = "listmonk_db" # Postgres container name in the compose file.
 52 | port = 5432
 53 | user = "listmonk"
 54 | password = "listmonk"
 55 | database = "listmonk"
 56 | ssl_mode = "disable"
 57 | max_open = 25
 58 | max_idle = 25
 59 | max_lifetime = "300s"
 60 | ```
 61 | 
 62 | #### 2. Mount the config file in docker-compose.yml
 63 | 
 64 | ```yaml
 65 |   app:
 66 |     ...
 67 |     volumes:
 68 |     - /path/on/your/host/config.toml:/listmonk/config.toml
 69 | ```
 70 | 
 71 | #### 3. Change the `--config ''` flags in the `command:` section to point to the path
 72 | 
 73 | ```yaml
 74 | command: [sh, -c, "./listmonk --install --idempotent --yes --config /listmonk/config.toml && ./listmonk --upgrade --yes --config /listmonk/config.toml && ./listmonk --config /listmonk/config.toml"]
 75 | ```
 76 | 
 77 | 
 78 | ## Compiling from source
 79 | 
 80 | To compile the latest unreleased version (`master` branch):
 81 | 
 82 | 1. Make sure `go`, `nodejs`, and `yarn` are installed on your system.
 83 | 2. `git clone git@github.com:knadh/listmonk.git`
 84 | 3. `cd listmonk && make dist`. This will generate the `listmonk` binary.
 85 | 
 86 | ## Release candidate (RC)
 87 | 
 88 | The `master` branch with bleeding edge changes is periodically built and published as `listmonk/listmonk:rc` on DockerHub. To run the latest pre-release version, replace all instances of `listmonk/listmonk:latest` with `listmonk/listmonk:rc` in the docker-compose.yml file and follow the Docker installation steps above. While it is generally safe to run release candidate versions, they may have issues that only get resolved in a general release.
 89 | 
 90 | ## Helm chart for Kubernetes
 91 | 
 92 | ![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 3.0.0](https://img.shields.io/badge/AppVersion-3.0.0-informational?style=flat-square)
 93 | 
 94 | A helm chart for easily installing listmonk on a kubernetes cluster is made available by community [here](https://github.com/th0th/helm-charts/tree/main/charts/listmonk).
 95 | 
 96 | In order to use the helm chart, you can configure `values.yaml` according to your needs, and then run the following command:
 97 | 
 98 | ```shell
 99 | $ helm upgrade \
100 |     --create-namespace \
101 |     --install listmonk listmonk \
102 |     --namespace listmonk \
103 |     --repo https://th0th.github.io/helm-charts \
104 |     --values values.yaml \
105 |     --version 0.1.0
106 | ```
107 | 
108 | ## 3rd party hosting
109 | 
110 | <a href="https://dash.elest.io/deploy?soft=Listmonk&id=237"><img src="https://elest.io/images/logos/deploy-to-elestio-btn.png" alt="Deploy to Elestio" height="35" style="max-width: 150px;" /></a>
111 | <br />
112 | <a href="https://www.pikapods.com/pods?run=listmonk"><img src="https://www.pikapods.com/static/run-button.svg" alt="Deploy on PikaPod" style="max-width: 150px;" /></a>
113 | <br />
114 | <a href="https://railway.app/new/template/listmonk"><img src="https://railway.app/button.svg" alt="One-click deploy on Railway" style="max-width: 150px;" /></a>
115 | <br />
116 | <a href="https://repocloud.io/details/?app_id=217"><img src="https://d16t0pc4846x52.cloudfront.net/deploy.png" alt="Deploy at RepoCloud" style="max-width: 150px;"/></a>
117 | <br />
118 | <a href="https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dlistmonk"><img src="https://cdn.jsdelivr.net/gh/labring-actions/templates@main/Deploy-on-Sealos.svg" alt="Deploy on Sealos" style="max-width: 150px;"/></a>
119 | <br />
120 | <a href="https://zeabur.com/templates/5EDMN6"><img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur" style="max-width: 150px;"/></a>
121 | 
122 | ## Tutorials
123 | 
124 | * [Informal step-by-step on how to get started with listmonk using *Railway*](https://github.com/knadh/listmonk/issues/120#issuecomment-1421838533)
125 | * [Step-by-step tutorial for installation and all basic functions. *Amazon EC2, SES, docker & binary*](https://gist.github.com/MaximilianKohler/e5158fcfe6de80a9069926a67afcae11)
126 | * [Step-by-step guide on how to install and set up listmonk on *AWS Lightsail with docker* (rameerez)](https://github.com/knadh/listmonk/issues/1208)
127 | * [Quick setup on any cloud server using *docker and caddy*](https://github.com/samyogdhital/listmonk-caddy-reverse-proxy)
128 | * [*Binary* install on Ubuntu 22.04 as a service](https://mumaritc.hashnode.dev/how-to-install-listmonk-using-binary-on-ubuntu-2204)
129 | * [*Binary* install on Ubuntu 18.04 as a service (Apache & Plesk)](https://devgypsy.com/post/2020-08-18-installing-listmonk-newsletter-manager/)
130 | * [*Binary and docker* on linux (techviewleo)](https://techviewleo.com/manage-mailing-list-and-newsletter-using-listmonk/)
131 | * [*Binary* install on your PC](https://www.youtube.com/watch?v=fAOBqgR9Yfo). Discussions of limitations: [[1](https://github.com/knadh/listmonk/issues/862#issuecomment-1307328228)][[2](https://github.com/knadh/listmonk/issues/248#issuecomment-1320806990)].
132 | * [*Docker on Rocky Linux 8* (nginx, Let's Encrypt SSL)](https://wiki.crowncloud.net/?How_to_Install_Listmonk_with_Docker_on_Rocky_Linux_8)
133 | * [*Docker* with nginx reverse proxy, certbot SSL, and Gmail SMTP](https://www.maketecheasier.com/create-own-newsletter-with-listmonk/)
134 | * [Install Listmonk on Self-hosting with *Pre-Configured AMI Package at AWS* by Single Click](https://meetrix.io/articles/how-to-install-llama-2-on-aws-with-pre-configured-ami-package/)
135 | * [Tutorial for deploying on *Fly.io*](https://github.com/paulrudy/listmonk-on-fly) -- Currently [not working](https://github.com/knadh/listmonk/issues/984#issuecomment-1694545255)
136 | 


--------------------------------------------------------------------------------
/docs/docs/content/maintenance/performance.md:
--------------------------------------------------------------------------------
 1 | # Performance
 2 | 
 3 | listmonk is built to be highly performant and can handle millions of subscribers with minimal system resources.
 4 | 
 5 | However, as the Postgres database grows—with a large number of subscribers, campaign views, and click records—it can significantly slow down certain aspects of the program, particularly in counting records and aggregating various statistics. For instance, loading admin pages that do these aggregations can take tens of seconds if the database has millions of subscribers.
 6 | 
 7 | - Aggregate counts, statistics, and charts on the landing dashboard.
 8 | - Subscriber count beside every list on the Lists page.
 9 | - Total subscriber count on the Subscribers page.
10 | 
11 | However, at that scale, viewing the exact number of subscribers or statistics every time the admin panel is accessed becomes mostly unnecessary. On installations with millions of subscribers, where the above pages do not load instantly, it is highly recommended to turn on the `Settings -> Performance -> Cache slow database queries` option.
12 | 
13 | ## Slow query caching
14 | 
15 | When this option is enabled, the subscriber counts on the Lists page, the Subscribers page, and the statistics on the dashboard, etc., are no longer counted in real-time in the database. Instead, they are updated periodically and cached, resulting in a massive performance boost. The periodicity can be configured on the Settings -> Performance page using a standard crontab expression (default: `0 3 * * *`, which means 3 AM daily). Use a tool like [crontab.guru](https://crontab.guru) for easily generating a desired crontab expression.
16 | 


--------------------------------------------------------------------------------
/docs/docs/content/messengers.md:
--------------------------------------------------------------------------------
 1 | # Messengers
 2 | 
 3 | listmonk supports multiple custom messaging backends in additional to the default SMTP e-mail backend, enabling not just e-mail campaigns, but arbitrary message campaigns such as SMS, FCM notifications etc.
 4 | 
 5 | A *Messenger* is a web service that accepts a campaign message pushed to it as a JSON request, which the service can in turn broadcast as SMS, FCM etc. Messengers are registered in the *Settings -> Messengers* UI, and can be selected on individual campaigns.
 6 | 
 7 | Messengers support optional BasicAuth authentication. `Plain text` format for campaign content is ideal for messengers such as SMS and FCM.
 8 | 
 9 | When a campaign starts, listmonk POSTs messages in the following format to the selected messenger's endpoint. The endpoint should return a `200 OK` response in case of a successful request.
10 | 
11 | The address required to broadcast the message, for instance, a phone number or an FCM ID, is expected to be stored and relayed as [subscriber attributes](concepts.md/#attributes). 
12 | 
13 | ```json
14 | {
15 | 	"subject": "Welcome to listmonk",
16 | 	"body": "The message body",
17 | 	"content_type": "plain",
18 | 	"recipients": [{
19 | 		"uuid": "e44b4135-1e1d-40c5-8a30-0f9a886c2884",
20 | 		"email": "anon@example.com",
21 | 		"name": "Anon Doe",
22 | 		"attribs": {
23 | 			"phone": "123123123",
24 | 			"fcm_id": "2e7e4b512e7e4b512e7e4b51",
25 | 			"city": "Bengaluru"
26 | 		},
27 | 		"status": "enabled"
28 | 	}],
29 | 	"campaign": {
30 | 		"uuid": "2e7e4b51-f31b-418a-a120-e41800cb689f",
31 | 		"name": "Test campaign",
32 | 		"tags": ["test-campaign"]
33 | 	}
34 | }
35 | ```
36 | 
37 | ## Messenger implementations
38 | 
39 | Following is a list of HTTP messenger servers that connect to various backends.
40 | 
41 | | Name                                                                                 | Backend          |
42 | |:-------------------------------------------------------------------------------------|:-----------------|
43 | | [listmonk-messenger](https://github.com/joeirimpan/listmonk-messenger)               | AWS Pinpoint SMS |
44 | | [listmonk-verimor-gateway](https://github.com/antandros/listmonk-verimor-gateway)    | Verimor          |
45 | | [listmonk-mailersend](https://github.com/tkawczynski/listmonk-mailersend)            | Mailersend       |
46 | | [listmonk-novu-messenger](https://github.com/Codepowercode/listmonk-novu-messenger)  | Novu             |
47 | | [listmonk-push-messenger](https://github.com/shyamkrishna21/listmonk-push-messenger) | Google FCM       |
48 | 


--------------------------------------------------------------------------------
/docs/docs/content/querying-and-segmentation.md:
--------------------------------------------------------------------------------
  1 | # Querying and segmenting subscribers
  2 | 
  3 | listmonk allows the writing of partial Postgres SQL expressions to query, filter, and segment subscribers.
  4 | 
  5 | ## Database fields
  6 | 
  7 | These are the fields in the subscriber database that can be queried.
  8 | 
  9 | | Field                    | Description                                                                                         |
 10 | | ------------------------ | --------------------------------------------------------------------------------------------------- |
 11 | | `subscribers.uuid`       | The randomly generated unique ID of the subscriber                                                  |
 12 | | `subscribers.email`      | E-mail ID of the subscriber                                                                         |
 13 | | `subscribers.name`       | Name of the subscriber                                                                              |
 14 | | `subscribers.status`     | Status of the subscriber (enabled, disabled, blocklisted)                                           |
 15 | | `subscribers.attribs`    | Map of arbitrary attributes represented as JSON. Accessed via the `->` and `->>` Postgres operator. |
 16 | | `subscribers.created_at` | Timestamp when the subscriber was first added                                                       |
 17 | | `subscribers.updated_at` | Timestamp when the subscriber was modified                                                          |
 18 | 
 19 | ## Sample attributes
 20 | 
 21 | Here's a sample JSON map of attributes assigned to an imaginary subscriber.
 22 | 
 23 | ```json
 24 | {
 25 |   "city": "Bengaluru",
 26 |   "likes_tea": true,
 27 |   "spoken_languages": ["English", "Malayalam"],
 28 |   "projects": 3,
 29 |   "stack": {
 30 |     "frameworks": ["echo", "go"],
 31 |     "languages": ["go", "python"],
 32 |     "preferred_language": "go"
 33 |   }
 34 | }
 35 | ```
 36 | 
 37 | ![listmonk screenshot](images/edit-subscriber.png)
 38 | 
 39 | ## Sample SQL query expressions
 40 | 
 41 | ![listmonk](images/query-subscribers.png)
 42 | 
 43 | #### Find a subscriber by e-mail
 44 | 
 45 | ```sql
 46 | -- Exact match
 47 | subscribers.email = 'some@domain.com'
 48 | 
 49 | -- Partial match to find e-mails that end in @domain.com.
 50 | subscribers.email LIKE '%@domain.com'
 51 | 
 52 | ```
 53 | 
 54 | #### Find a subscriber by name
 55 | 
 56 | ```sql
 57 | -- Find all subscribers whose name start with John.
 58 | subscribers.email LIKE 'John%'
 59 | 
 60 | ```
 61 | 
 62 | #### Multiple conditions
 63 | 
 64 | ```sql
 65 | -- Find all Johns who have been blocklisted.
 66 | subscribers.email LIKE 'John%' AND status = 'blocklisted'
 67 | ```
 68 | 
 69 | #### Querying subscribers who viewed the campaign email
 70 | 
 71 | ```sql
 72 | -- Find all subscribers who viewed the campaign email.
 73 | EXISTS(SELECT 1 FROM campaign_views WHERE campaign_views.subscriber_id=subscribers.id AND campaign_views.campaign_id=<put_id_of_campaign>)
 74 | ```
 75 | 
 76 | #### Querying attributes
 77 | 
 78 | ```sql
 79 | -- The ->> operator returns the value as text. Find all subscribers
 80 | -- who live in Bengaluru and have done more than 3 projects.
 81 | -- Here 'projects' is cast into an integer so that we can apply the
 82 | -- numerical operator >
 83 | subscribers.attribs->>'city' = 'Bengaluru' AND
 84 |     (subscribers.attribs->>'projects')::INT > 3
 85 | ```
 86 | 
 87 | #### Querying nested attributes
 88 | 
 89 | ```sql
 90 | -- Find all blocklisted subscribers who like to drink tea, can code Python
 91 | -- and prefer coding Go.
 92 | --
 93 | -- The -> operator returns the value as a structure. Here, the "languages" field
 94 | -- The ? operator checks for the existence of a value in a list.
 95 | subscribers.status = 'blocklisted' AND
 96 |     (subscribers.attribs->>'likes_tea')::BOOLEAN = true AND
 97 |     subscribers.attribs->'stack'->'languages' ? 'python' AND
 98 |     subscribers.attribs->'stack'->>'preferred_language' = 'go'
 99 | 
100 | ```
101 | 
102 | To learn how to write SQL expressions to do advancd querying on JSON attributes, refer to the Postgres [JSONB documentation](https://www.postgresql.org/docs/11/functions-json.html).
103 | 


--------------------------------------------------------------------------------
/docs/docs/content/static/style.css:
--------------------------------------------------------------------------------
  1 | body[data-md-color-primary="white"] .md-header[data-md-state="shadow"] {
  2 |   background: #fff;
  3 |   box-shadow: none;
  4 |   color: #333;
  5 | 
  6 |   box-shadow: 1px 1px 3px #ddd;
  7 | }
  8 | 
  9 | .md-typeset .md-typeset__table table {
 10 |   border: 1px solid #ddd;
 11 |   box-shadow: 2px 2px 0 #f3f3f3;
 12 |   overflow: inherit;
 13 | }
 14 | 
 15 | body[data-md-color-primary="white"] .md-search__input {
 16 |   background: #f6f6f6;
 17 |   color: #333;
 18 | }
 19 | 
 20 | body[data-md-color-primary="white"]
 21 |   .md-sidebar--secondary
 22 |   .md-sidebar__scrollwrap {
 23 |   background: #f6f6f6;
 24 |   padding: 10px 0;
 25 | }
 26 | 
 27 | .md-nav__item--section > .md-nav__link[for] {
 28 |   color: #333;
 29 | }
 30 | .md-nav__item--section {
 31 |   margin-bottom: 20px;
 32 | }
 33 | .md-nav__item--nested .md-nav__list {
 34 |   margin-left: 20px;
 35 |   border-left: 1px solid #ddd;
 36 | }
 37 | 
 38 | body[data-md-color-primary="white"] a.md-nav__link--active {
 39 |   font-weight: 600;
 40 |   color: inherit;
 41 |   color: #0055d4;
 42 | }
 43 | body[data-md-color-primary="white"] .md-nav__item a:hover {
 44 |   color: #0055d4;
 45 | }
 46 | 
 47 | body[data-md-color-primary="white"] thead,
 48 | body[data-md-color-primary="white"] .md-typeset table:not([class]) th {
 49 |   background: #f6f6f6;
 50 |   border: 0;
 51 |   color: inherit;
 52 |   font-weight: 600;
 53 | }
 54 | table td span {
 55 |   font-size: 0.85em;
 56 |   color: #bbb;
 57 |   display: block;
 58 | }
 59 | 
 60 | .md-typeset h1, .md-typeset h2 {
 61 |   font-weight: 500;
 62 | }
 63 | 
 64 | body[data-md-color-primary="white"] .md-typeset h1 {
 65 |   margin: 4rem 0 0 0;
 66 |   color: inherit;
 67 |   border-top: 1px solid #ddd;
 68 |   padding-top: 2rem;
 69 | }
 70 | body[data-md-color-primary="white"] .md-typeset h2 {
 71 |   border-top: 1px solid #eee;
 72 |   padding-top: 2rem;
 73 | }
 74 | 
 75 | body[data-md-color-primary="white"] .md-content h1:first-child {
 76 |   margin: 0 0 3rem 0;
 77 |   padding: 0;
 78 |   border: 0;
 79 | }
 80 | 
 81 | body[data-md-color-primary="white"] .md-typeset code {
 82 |   word-break: normal;
 83 | }
 84 | 
 85 | li img {
 86 |   background: #fff;
 87 |   border-radius: 6px;
 88 |   border: 1px solid #e6e6e6;
 89 |   box-shadow: 1px 1px 4px #e6e6e6;
 90 |   padding: 5px;
 91 |   margin-top: 10px;
 92 | }
 93 | 
 94 | /* This hack places the #anchor-links correctly
 95 | by accommodating for the fixed-header's height */
 96 | :target:before {
 97 |   content: "";
 98 |   display: block;
 99 |   height: 120px;
100 |   margin-top: -120px;
101 | }
102 | 
103 | .md-typeset a {
104 |   color: #0055d4;
105 | }
106 | .md-typeset a:hover {
107 |   color: #666 !important;
108 |   text-decoration: underline;
109 | }
110 | .md-typeset hr {
111 |   background: #f6f6f6;
112 |   margin: 60px 0;
113 |   display: block;
114 | }
115 | .md-header--shadow {
116 |   box-shadow: 0 4px 3px #eee;
117 |   transition: none;
118 | }
119 | .md-header__topic:first-child {
120 |   font-weight: normal;
121 | }


--------------------------------------------------------------------------------
/docs/docs/content/templating.md:
--------------------------------------------------------------------------------
  1 | # Templating
  2 | 
  3 | A template is a re-usable HTML design that can be used across campaigns and transactional messages. Most commonly, templates have standard header and footer areas with logos and branding elements, where campaign content is inserted in the middle. listmonk supports Go template expressions that lets you create powerful, dynamic HTML templates.
  4 | 
  5 | listmonk supports [Go template](https://pkg.go.dev/text/template) expressions that lets you create powerful, dynamic HTML templates. It also integrates 100+ useful [Sprig template functions](https://masterminds.github.io/sprig/).
  6 | 
  7 | ## Campaign templates
  8 | Campaign templates are used in an e-mail campaigns. These template are created and managed on the UI under `Campaigns -> Templates`, and are selected when creating new campaigns.
  9 | 
 10 | ## Transactional templates
 11 | Transactional templates are used for sending arbitrary transactional messages using the transactional API. These template are created and managed on the UI under `Campaigns -> Templates`.
 12 | 
 13 | ## Template expressions
 14 | 
 15 | There are several template functions and expressions that can be used in campaign and template bodies. They are written in the form `{{ .Subscriber.Email }}`, that is, an expression between double curly braces `{{` and `}}`.
 16 | 
 17 | ### Subscriber fields
 18 | 
 19 | | Expression                    | Description                                                                                  |
 20 | | ----------------------------- | -------------------------------------------------------------------------------------------- |
 21 | | `{{ .Subscriber.UUID }}`      | The randomly generated unique ID of the subscriber                                           |
 22 | | `{{ .Subscriber.Email }}`     | E-mail ID of the subscriber                                                                  |
 23 | | `{{ .Subscriber.Name }}`      | Name of the subscriber                                                                       |
 24 | | `{{ .Subscriber.FirstName }}` | First name of the subscriber (automatically extracted from the name)                         |
 25 | | `{{ .Subscriber.LastName }}`  | Last name of the subscriber (automatically extracted from the name)                          |
 26 | | `{{ .Subscriber.Status }}`    | Status of the subscriber (enabled, disabled, blocklisted)                                    |
 27 | | `{{ .Subscriber.Attribs }}`   | Map of arbitrary attributes. Fields can be accessed with `.`, eg: `.Subscriber.Attribs.city` |
 28 | | `{{ .Subscriber.CreatedAt }}` | Timestamp when the subscriber was first added                                                |
 29 | | `{{ .Subscriber.UpdatedAt }}` | Timestamp when the subscriber was modified                                                   |
 30 | 
 31 | | Expression            | Description                                              |
 32 | | --------------------- | -------------------------------------------------------- |
 33 | | `{{ .Campaign.UUID }}`      | The randomly generated unique ID of the campaign         |
 34 | | `{{ .Campaign.Name }}`      | Internal name of the campaign                            |
 35 | | `{{ .Campaign.Subject }}`   | E-mail subject of the campaign                           |
 36 | | `{{ .Campaign.FromEmail }}` | The e-mail address from which the campaign is being sent |
 37 | 
 38 | ### Functions
 39 | 
 40 | | Function                                    | Description                                                                                                                                                    |
 41 | | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 42 | | `{{ Date "2006-01-01" }}`                   | Prints the current datetime for the given format expressed as a [Go date layout](https://yourbasic.org/golang/format-parse-string-time-date-example/) |
 43 | | `{{ TrackLink "https://link.com" }}` | Takes a URL and generates a tracking URL over it. For use in campaign bodies and templates.                                                                    |
 44 | | `https://link.com@TrackLink`         | Shorthand for `TrackLink`. Eg: `<a href="https://link.com@TrackLink">Link</a>`                                                                       |
 45 | | `{{ TrackView }}`                           | Inserts a single tracking pixel. Should only be used once, ideally in the template footer.                                                                     |
 46 | | `{{ UnsubscribeURL }}`                      | Unsubscription and Manage preferences URL. Ideal for use in the template footer.                                                                                                      |
 47 | | `{{ MessageURL }}`                          | URL to view the hosted version of an e-mail message.                                                                                                           |
 48 | | `{{ OptinURL }}`                            | URL to the double-optin confirmation page.                                                                                                                     |
 49 | | `{{ Safe "<!-- comment -->" }}`             | Add any HTML code as it is.                                                                                                                                   |
 50 | 
 51 | ### Sprig functions
 52 | listmonk integrates the Sprig library that offers 100+ utility functions for working with strings, numbers, dates etc. that can be used in templating. Refer to the [Sprig documentation](https://masterminds.github.io/sprig/) for the full list of functions.
 53 | 
 54 | 
 55 | ### Example template
 56 | 
 57 | The expression `{{ template "content" . }}` should appear exactly once in every template denoting the spot where an e-mail's content is inserted. Here's a sample HTML e-mail that has a fixed header and footer that inserts the content in the middle.
 58 | 
 59 | ```html
 60 | <!DOCTYPE html>
 61 | <html>
 62 |   <head>
 63 |     <style>
 64 |       body {
 65 |         background: #eee;
 66 |         font-family: Arial, sans-serif;
 67 |         font-size: 6px;
 68 |         color: #111;
 69 |       }
 70 |       header {
 71 |         border-bottom: 1px solid #ddd;
 72 |         padding-bottom: 30px;
 73 |         margin-bottom: 30px;
 74 |       }
 75 |       .container {
 76 |         background: #fff;
 77 |         width: 450px;
 78 |         margin: 0 auto;
 79 |         padding: 30px;
 80 |       }
 81 |     </style>
 82 |   </head>
 83 |   <body>
 84 |     <section class="container">
 85 |       <header>
 86 |         <!-- This will appear in the header of all e-mails.
 87 |              The subscriber's name will be automatically inserted here. //-->
 88 |         Hi {{ .Subscriber.FirstName }}!
 89 |       </header>
 90 | 
 91 |       <!-- This is where the e-mail body will be inserted //-->
 92 |       <div class="content">
 93 |         {{ template "content" . }}
 94 |       </div>
 95 | 
 96 |       <footer>
 97 |         Copyright 2019. All rights Reserved.
 98 |       </footer>
 99 | 
100 |       <!-- The tracking pixel will be inserted here //-->
101 |       {{ TrackView }}
102 |     </section>
103 |   </body>
104 | </html>
105 | ```
106 | 
107 | !!! info
108 |     For use with plaintext campaigns, create a template with no HTML content and just the placeholder `{{ template "content" . }}`
109 | 
110 | ### Example campaign body
111 | 
112 | Campaign bodies can be composed using the built-in WYSIWYG editor or as raw HTML documents. Assuming that the subscriber has a set of [attributes defined](querying-and-segmentation.md#sample-attributes), this example shows how to render those values in a campaign.
113 | 
114 | ```
115 | Hey, did you notice how the template showed your first name?
116 | Your last name is {{.Subscriber.LastName }}.
117 | 
118 | You have done {{ .Subscriber.Attribs.projects }} projects.
119 | 
120 | 
121 | {{ if eq .Subscriber.Attribs.city "Bengaluru" }}
122 |   You live in Bangalore!
123 | {{ else }}
124 |   Where do you live?
125 | {{ end }}
126 | 
127 | 
128 | Here is a link for you to click that will be tracked.
129 | <a href="{{ TrackLink "https://google.com" }}">Google</a>
130 | 
131 | ```
132 | 
133 | The above example uses an `if` condition to show one of two messages depending on the value of a subscriber attribute. Many such dynamic expressions are possible with Go templating expressions.
134 | 
135 | ## System templates
136 | System templates are used for rendering public user-facing pages such as the subscription management page, and in automatically generated system e-mails such as the opt-in confirmation e-mail. These are bundled into listmonk but can be customized by copying the [static directory](https://github.com/knadh/listmonk/tree/master/static) locally, and passing its path to listmonk with the `./listmonk --static-dir=your/custom/path` flag.
137 | 
138 | You can fetch the static files with:<br>
139 | `mkdir -p /home/ubuntu/listmonk/static ; wget -O - https://github.com/knadh/listmonk/archive/master.tar.gz | tar xz -C /home/ubuntu/listmonk/static --strip=2 "listmonk-master/static"`
140 | 
141 | [Docker example](https://yasoob.me/posts/setting-up-listmonk-opensource-newsletter-mailing/#custom-static-files), [binary example](https://github.com/knadh/listmonk/blob/master/listmonk-simple.service).
142 | 
143 | 
144 | ### Public pages
145 | 
146 | | /static/public/        |                                                          |
147 | |------------------------|--------------------------------------------------------------------|
148 | | `index.html`             | Base template with the header and footer that all pages use.        |
149 | | `home.html`              | Landing page on the root domain with the login button.              |
150 | | `message.html`           | Generic success / failure message page.                             |
151 | | `optin.html`             | Opt-in confirmation page.                                           |
152 | | `subscription.html`      | Subscription management page with options for data export and wipe. |
153 | | `subscription-form.html` | List selection and subscription form page.                          |
154 | 
155 | 
156 | To edit the appearance of the public pages using CSS and Javascript, head to Settings > Appearance > Public:
157 | 
158 | ![image](https://user-images.githubusercontent.com/55474996/153739792-93074af6-d1dd-40aa-8cde-c02ea4bbb67b.png)
159 | 
160 | 
161 | 
162 | ### System e-mails
163 | 
164 | | /static/email-templates/         |                                                                                                                                    |
165 | |----------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
166 | | `base.html`                      | Base template with the header and footer that all system generated e-mails use.                                               |
167 | | `campaign-status.html`           | E-mail notification that is sent to admins on campaign start, completion etc.                                                      |
168 | | `import-status.html`             | E-mail notification that is sent to admins on finish of an import job.                                                             |
169 | | `subscriber-data.html`           | E-mail that is sent to subscribers when they request a full dump of their private data.                                            |
170 | | `subscriber-optin.html`          | Automatic opt-in confirmation e-mail that is sent to an unconfirmed subscriber when they are added.                                |
171 | | `subscriber-optin-campaign.html` | E-mail content that's inserted into a campaign body when starting an opt-in campaign from the lists page.                          |
172 | | `default.tpl`                    | Default campaign template that is created in Campaigns -> Templates when listmonk is first installed. This is not used after that. |
173 | 
174 | !!! info
175 |     To turn system e-mail templates to plaintext, remove `<!doctype html>` from base.html and remove all HTML tags from the templates while retaining the Go templating code.
176 | 


--------------------------------------------------------------------------------
/docs/docs/content/upgrade.md:
--------------------------------------------------------------------------------
 1 | # Upgrade
 2 | 
 3 | !!! Warning
 4 |     Always take a backup of the Postgres database before upgrading listmonk
 5 | 
 6 | ## Binary
 7 | - Stop the running instance of listmonk.
 8 | - Download the [latest release](https://github.com/knadh/listmonk/releases) and extract the listmonk binary and overwrite the previous version.
 9 | - `./listmonk --upgrade` to upgrade an existing database schema. Upgrades are idempotent and running them multiple times have no side effects.
10 | - Run `./listmonk` again.
11 | 
12 | If you installed listmonk as a service, you will need to stop it before overwriting the binary. Something like `sudo systemctl stop listmonk` or `sudo service listmonk stop` should work. Then overwrite the binary with the new version, then run `./listmonk --upgrade, and `start` it back with the same commands.
13 | 
14 | If it's not running as a service, `pkill -9 listmonk` will stop the listmonk process.
15 | 
16 | ## Docker
17 | **Important:** The following instructions are for the new [docker-compose.yml](https://github.com/knadh/listmonk/blob/master/docker-compose.yml) file.
18 | 
19 | ```shell
20 | docker compose down app
21 | docker compose pull
22 | docker compose up app -d
23 | ```
24 | 
25 | If you are using an older docker-compose.yml file, you have to run the `--upgrade` step manually.
26 | 
27 | ```shell
28 | docker-compose down
29 | docker-compose pull && docker-compose run --rm app ./listmonk --upgrade
30 | docker-compose up -d app db
31 | ```
32 | 
33 | 
34 | ## Railway
35 | - Head to your dashboard, and select your Listmonk project.
36 | - Select the GitHub deployment service.
37 | - In the Deployment tab, head to the latest deployment, click on the three vertical dots to the right, and select "Redeploy".
38 | 
39 | ![Railway Redeploy option](https://user-images.githubusercontent.com/55474996/226517149-6dc512d5-f862-46f7-a57d-5e55b781ff53.png)
40 | 
41 | ## Downgrade
42 | 
43 | To restore a previous version, you have to restore the DB for that particular version. DBs that have been upgraded with a particular version shouldn't be used with older versions. There may be DB changes that a new version brings that are incompatible with previous versions.
44 | 
45 | **General steps:**
46 | 
47 | 1. Stop listmonk.
48 | 2. Restore your pre-upgrade database.
49 | 3. If you're using `docker compose`, edit `docker-compose.yml` and change `listmonk:latest` to `listmonk:v2.4.0` _(for example)_.
50 | 4. Restart.
51 | 
52 | **Example with docker:**
53 | 
54 | 1. Stop listmonk (app):
55 | ```
56 | sudo docker stop listmonk_app
57 | ```
58 | 2. Restore your pre-upgrade db (required) _(be careful, this will wipe your existing DB)_:
59 | ```
60 | psql -h 127.0.0.1 -p 9432 -U listmonk
61 | drop schema public cascade;
62 | create schema public;
63 | \q
64 | psql -h 127.0.0.1 -p 9432 -U listmonk -W listmonk < listmonk-preupgrade-db.sql
65 | ```
66 | 3. Edit the `docker-compose.yml`:
67 | ```
68 | x-app-defaults: &app-defaults
69 |   restart: unless-stopped
70 |   image: listmonk/listmonk:v2.4.0
71 | ```
72 | 4. Restart:
73 | `sudo docker compose up -d app db nginx certbot`
74 | 
75 | 
76 | ## Upgrading to v4.x.x
77 | v4 is a major upgrade from prior versions with significant changes to certain important features and behaviour. It is the first version to have multi-user support and full fledged user management. Prior versions only had a simple BasicAuth for both admin login (browser prompt) and API calls, with the username and password defined in the TOML configuration file.
78 | 
79 | It is safe to upgrade an older installation with `--upgrade`, but there are a few important things to keep in mind. The upgrade automatically imports the `admin_username` and `admin_password` defined in the TOML configuration into the new user management system.
80 | 
81 | 1. **New login UI**: Once you upgrade an older installation, the admin dashboard will no longer show the native browser prompt for login. Instead, a new login UI rendered by listmonk is displayed at the URI `/admin/login`.
82 | 
83 | 1. **API credentials**: If you are using APIs to interact with listmonk, after logging in, go to Settings -> Users and create a new API user with the necessary permissions. Change existing API integrations to use these credentials instead of the old username and password defined in the legacy TOML configuration file or environment variables.
84 | 
85 | 1. **Credentials in TOML file or old environment variables**: The admin dashboard shows a warning until the `admin_username` and `admin_password` fields are removed from the configuration file or old environment variables. In v4.x.x, these are irrelevant as user credentials are stored in the database and managed from the admin UI. IMPORTANT: if you are using APIs to interact with listmonk, follow the previous step before removing the legacy credentials.
86 | 


--------------------------------------------------------------------------------
/docs/docs/mkdocs.yml:
--------------------------------------------------------------------------------
 1 | site_name: listmonk / Documentation
 2 | theme:
 3 |   name: material
 4 |   # custom_dir: "mkdocs-material/material"
 5 |   logo: "images/favicon.png"
 6 |   favicon: "images/favicon.png"
 7 |   language: "en"
 8 |   font:
 9 |     text: 'Inter'
10 |     weights: 400
11 |   direction: 'ltr'
12 |   extra:
13 |   search:
14 |     language: 'en'
15 |   feature:
16 |     tabs: true
17 |   features:
18 |     - navigation.indexes
19 |     - navigation.sections
20 |     - content.code.copy
21 | 
22 |   palette:
23 |     primary: "white"
24 |     accent: "red"
25 | 
26 | site_dir: _out
27 | docs_dir: content
28 | 
29 | markdown_extensions:
30 |   - admonition
31 |   - pymdownx.highlight
32 |   - pymdownx.superfences
33 |   - toc:
34 |       permalink: true
35 | 
36 | extra_css:
37 |   - "static/style.css"
38 | 
39 | copyright: "CC BY-SA 4.0"
40 | 
41 | nav:
42 |   - "Introduction": index.md
43 |   - "Getting Started":
44 |     - "Installation": installation.md
45 |     - "Configuration": configuration.md
46 |     - "Upgrade": upgrade.md
47 |   - "Using listmonk":
48 |     - "Concepts": concepts.md
49 |     - "Templating": templating.md
50 |     - "Querying and segmenting subscribers": querying-and-segmentation.md
51 |     - "Bounce processing": bounces.md
52 |     - "Messengers": "messengers.md"
53 |     - "Archives": "archives.md"
54 |     - "Internationalization": "i18n.md"
55 |     - "Integrating with external systems": external-integration.md
56 |   - "API":
57 |     - "Introduction": apis/apis.md
58 |     - "SDKs and libs": apis/sdks.md
59 |     - "Subscribers": apis/subscribers.md
60 |     - "Lists": apis/lists.md
61 |     - "Import": apis/import.md
62 |     - "Campaigns": apis/campaigns.md
63 |     - "Media": apis/media.md
64 |     - "Templates": apis/templates.md
65 |     - "Transactional": apis/transactional.md
66 |     - "Bounces": apis/bounces.md
67 |   - "Maintenance":
68 |     - "Performance": maintenance/performance.md
69 |   - "Contributions":
70 |     - "Developer setup": developer-setup.md
71 | 


--------------------------------------------------------------------------------
/docs/i18n/index.html:
--------------------------------------------------------------------------------
/docs/i18n/main.js:
--------------------------------------------------------------------------------
  1 | const BASEURL = "https://raw.githubusercontent.com/knadh/listmonk/master/i18n/";
  2 | const BASELANG = "en";
  3 | 
  4 | var app = new Vue({
  5 | 	el: "#app",
  6 | 	data: {
  7 | 		base: {},
  8 | 		keys: [],
  9 | 		visibleKeys: {},
 10 | 		values: {},
 11 | 		view: "all",
 12 | 		loadLang: BASELANG,
 13 | 
 14 | 		isRawVisible: false,
 15 | 		rawData: "{}"
 16 | 	},
 17 | 
 18 | 	methods: {
 19 | 		init() {
 20 | 			document.querySelector("#app").style.display = 'block';
 21 | 			document.querySelector("#loading").remove();
 22 | 		},
 23 | 
 24 | 		loadBaseLang(url) {
 25 | 			return fetch(url).then(response => response.json()).then(data => {
 26 | 				// Retain the base values.
 27 | 				Object.assign(this.base, data);
 28 | 
 29 | 				// Get the sorted keys from the language map.
 30 | 				const keys = [];
 31 | 				const visibleKeys = {};
 32 | 				let head = null;
 33 | 				Object.entries(this.base).sort((a, b) => a[0].localeCompare(b[0])).forEach((v) => {
 34 | 					const h = v[0].split('.')[0];
 35 | 					keys.push({
 36 | 						"key": v[0],
 37 | 						"head": (head !== h ? h : null) // eg: campaigns on `campaigns.something.else`
 38 | 					});
 39 | 
 40 | 					visibleKeys[v[0]] = true;
 41 | 					head = h;
 42 | 				});
 43 | 
 44 | 				this.keys = keys;
 45 | 				this.visibleKeys = visibleKeys;
 46 | 				this.values = { ...this.base };
 47 | 
 48 | 				// Is there cached localStorage data?
 49 | 				if (localStorage.data) {
 50 | 					try {
 51 | 						this.populateData(JSON.parse(localStorage.data));
 52 | 					} catch (e) {
 53 | 						console.log("Bad JSON in localStorage: " + e.toString());
 54 | 					}
 55 | 					return;
 56 | 				}
 57 | 			});
 58 | 		},
 59 | 
 60 | 		populateData(data) {
 61 | 			// Filter out all keys from data except for the base ones
 62 | 			// in the base language.
 63 | 			const vals = this.keys.reduce((a, key) => {
 64 | 				a[key.key] = data.hasOwnProperty(key.key) ? data[key.key] : this.base[key.key];
 65 | 				return a;
 66 | 			}, {});
 67 | 
 68 | 			this.values = vals;
 69 | 			this.saveData();
 70 | 		},
 71 | 
 72 | 		loadLanguage(lang) {
 73 | 			return fetch(BASEURL + lang + ".json").then(response => response.json()).then(data => {
 74 | 				this.populateData(data);
 75 | 			}).catch((e) => {
 76 | 				console.log(e);
 77 | 				alert("error fetching file: " + e.toString());
 78 | 			});
 79 | 		},
 80 | 
 81 | 		saveData() {
 82 | 			localStorage.data = JSON.stringify(this.values);
 83 | 		},
 84 | 
 85 | 		// Has a key been translated (changed from the base)?
 86 | 		isDone(key) {
 87 | 			return this.values[key] && this.base[key] !== this.values[key];
 88 | 		},
 89 | 
 90 | 		isItemVisible(key) {
 91 | 			return this.visibleKeys[key];
 92 | 		},
 93 | 
 94 | 		onToggleRaw() {
 95 | 			if (!this.isRawVisible) {
 96 | 				this.rawData = JSON.stringify(this.values, Object.keys(this.values).sort(), 4);
 97 | 			} else {
 98 | 				try {
 99 | 					this.populateData(JSON.parse(this.rawData));
100 | 				} catch (e) {
101 | 					alert("error parsing JSON: " + e.toString());
102 | 					return false;
103 | 				}
104 | 			}
105 | 
106 | 			this.isRawVisible = !this.isRawVisible;
107 | 		},
108 | 
109 | 		onLoadLanguage() {
110 | 			if (!confirm("Loading this language will overwrite your local changes. Continue?")) {
111 | 				return false;
112 | 			}
113 | 
114 | 			this.loadLanguage(this.loadLang);
115 | 		},
116 | 
117 | 		onNewLang() {
118 | 			if (!confirm("Creating a new language will overwrite your local changes. Continue?")) {
119 | 				return false;
120 | 			}
121 | 
122 | 			let data = { ...this.base };
123 | 			data["_.code"] = "iso-code-here"
124 | 			data["_.name"] = "New language"
125 | 			this.populateData(data);
126 | 		},
127 | 
128 | 		onDownloadJSON() {
129 | 			// Create a Blob using the content, mimeType, and optional encoding
130 | 			const blob = new Blob([JSON.stringify(this.values, Object.keys(this.values).sort(), 4)], { type: "" });
131 | 
132 | 			// Create an anchor element with a download attribute
133 | 			const link = document.createElement('a');
134 | 			link.download = `${this.values["_.code"]}.json`;
135 | 			link.href = URL.createObjectURL(blob);
136 | 
137 | 			// Append the link to the DOM, click it to start the download, and remove it
138 | 			document.body.appendChild(link);
139 | 			link.click();
140 | 			document.body.removeChild(link);
141 | 		}
142 | 	},
143 | 
144 | 	mounted() {
145 | 		this.loadBaseLang(BASEURL + BASELANG + ".json").then(() => this.init());
146 | 	},
147 | 
148 | 	watch: {
149 | 		view(v) {
150 | 			// When the view changes, create a copy of the items to be filtered
151 | 			// by and filter the view based on that. Otherwise, the moment the value
152 | 			// in the input changes, the list re-renders making items disappear.
153 | 
154 | 			const visibleKeys = {};
155 | 			this.keys.forEach((k) => {
156 | 				let visible = true;
157 | 
158 | 				if (v === "pending") {
159 | 					visible = !this.isDone(k.key);
160 | 				} else if (v === "complete") {
161 | 					visible = this.isDone(k.key);
162 | 				}
163 | 
164 | 				if (visible) {
165 | 					visibleKeys[k.key] = true;
166 | 				}
167 | 			});
168 | 
169 | 			this.visibleKeys = visibleKeys;
170 | 		}
171 | 	},
172 | 
173 | 	computed: {
174 | 		completed() {
175 | 			let n = 0;
176 | 
177 | 			this.keys.forEach(k => {
178 | 				if (this.values[k.key] !== this.base[k.key]) {
179 | 					n++;
180 | 				}
181 | 			});
182 | 
183 | 			return n;
184 | 		}
185 | 	}
186 | });
187 | 


--------------------------------------------------------------------------------
/docs/i18n/style.css:
--------------------------------------------------------------------------------
  1 | * {
  2 | 	box-sizing: border-box;
  3 | }
  4 | 
  5 | body {
  6 | 	font-family: Inter, "Helvetica Neue", "Segoe UI", sans-serif;
  7 | 	font-size: 16px;
  8 | 	line-height: 24px;
  9 | }
 10 | 
 11 | h1, h2, h3, h4, h5 {
 12 | 	margin: 0 0 15px 0;
 13 | }
 14 | 
 15 | a {
 16 | 	color: #0055d4;
 17 | }
 18 | 
 19 | .container {
 20 | 	padding: 30px;
 21 | }
 22 | 
 23 | .header {
 24 | 	align-items: center;
 25 | 	margin-bottom: 30px;
 26 | }
 27 | 	.header a {
 28 | 		display: inline-block;
 29 | 		margin-right: 15px;
 30 | 	}
 31 | 	.header .controls {
 32 | 		display: flex;
 33 | 	}
 34 | 		.header .controls .pending {
 35 | 			color: #ff3300;
 36 | 		}
 37 | 		.header .controls .complete {
 38 | 			color: #05a200;
 39 | 		}
 40 | 	.header .title {
 41 | 		margin: 0 0 15px 0;
 42 | 	}
 43 | 	.header .block {
 44 | 		margin: 0 45px 0 0;
 45 | 	}
 46 | 	.header .view label {
 47 | 		cursor: pointer;
 48 | 		margin-right: 10px;
 49 | 		display: inline-block;
 50 | 	}
 51 | 
 52 | #app {
 53 | 	display: none;
 54 | }
 55 | 
 56 | .data .key,
 57 | .data .base {
 58 | 	display: block;
 59 | 	color: #777;
 60 | 	display: block;
 61 | }
 62 | 	.data .item {
 63 | 		padding: 15px;
 64 | 		clear: both;
 65 | 	}
 66 | 		.data .item:hover {
 67 | 			background: #eee;
 68 | 		}
 69 | 		.data .item.done .num {
 70 | 			color: #05a200;
 71 | 		}
 72 | 		.data .item.done .num::after {
 73 | 			content: '✓';
 74 | 			font-weight: bold;
 75 | 		}
 76 | 
 77 | 	.data .controls {
 78 | 		display: flex;
 79 | 	}
 80 | 	.data .fields {
 81 | 		flex-grow: 1;
 82 | 	}
 83 | 	.data .num {
 84 | 		margin-right: 15px;
 85 | 		min-width: 50px;
 86 | 	}
 87 | 	.data .key {
 88 | 		color: #aaa;
 89 | 		font-size: 0.875em;
 90 | 	}
 91 | 	.data input {
 92 | 		width: 100%;
 93 | 		border: 1px solid #ddd;
 94 | 		padding: 5px;
 95 | 		display: block;
 96 | 		margin: 3px 0;
 97 | 
 98 | 	}
 99 | 	.data input:focus {
100 | 		border-color: #666;
101 | 	}
102 | 	.data p {
103 | 		margin: 0 0 3px 0;
104 | 	}
105 | 	.data .head {
106 | 		margin: 0 0 15px 0;
107 | 	}
108 | 
109 | .raw textarea {
110 | 	border: 1px solid #ddd;
111 | 	padding: 5px;
112 | 	width: 100%;
113 | 	height: 90vh;
114 | }


--------------------------------------------------------------------------------
/docs/site/.hugo_build.lock:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/.hugo_build.lock


--------------------------------------------------------------------------------
/docs/site/config.toml:
--------------------------------------------------------------------------------
1 | baseurl = "https://listmonk.app/"
2 | languageCode = "en-us"
3 | title = "listmonk - Free and open source self-hosted newsletter, mailing list manager, and transactional mails"
4 | 
5 | [taxonomies]
6 |   tag = "tags"
7 | 


--------------------------------------------------------------------------------
/docs/site/content/.gitignore:
--------------------------------------------------------------------------------
1 | 
2 | 


--------------------------------------------------------------------------------
/docs/site/data/github.json:
--------------------------------------------------------------------------------
1 | {"version":"v4.1.0","date":"2024-11-12T18:49:52Z","url":"https://github.com/knadh/listmonk/releases/tag/v4.1.0","assets":[{"name":"darwin","url":"https://github.com/knadh/listmonk/releases/download/v4.1.0/listmonk_4.1.0_darwin_amd64.tar.gz"},{"name":"freebsd","url":"https://github.com/knadh/listmonk/releases/download/v4.1.0/listmonk_4.1.0_freebsd_amd64.tar.gz"},{"name":"linux","url":"https://github.com/knadh/listmonk/releases/download/v4.1.0/listmonk_4.1.0_linux_amd64.tar.gz"},{"name":"netbsd","url":"https://github.com/knadh/listmonk/releases/download/v4.1.0/listmonk_4.1.0_netbsd_amd64.tar.gz"},{"name":"openbsd","url":"https://github.com/knadh/listmonk/releases/download/v4.1.0/listmonk_4.1.0_openbsd_amd64.tar.gz"},{"name":"windows","url":"https://github.com/knadh/listmonk/releases/download/v4.1.0/listmonk_4.1.0_windows_amd64.tar.gz"}]}
2 | 


--------------------------------------------------------------------------------
/docs/site/layouts/index.html:
--------------------------------------------------------------------------------
  1 | {{ partial "header.html" . }}
  2 | <div class="splash container center">
  3 |       <img class="s4" src="static/images/s4.png" />
  4 |       <div class="hero">
  5 |         <h1 class="title">Self-hosted newsletter and mailing list manager</h1>
  6 |         <h3 class="sub">
  7 |           Performance and features packed into a single binary.<br />
  8 |           <strong>Free and open source.</strong>
  9 |         </h3>
 10 |         <p class="center demo">
 11 |           <a href="https://demo.listmonk.app" class="button">Live demo</a>
 12 |         </p>
 13 |       </div>
 14 | 
 15 |       <div class="confetti">
 16 |         <img class="s1" src="static/images/s1.png" />
 17 |         <img class="s2" src="static/images/s2.png" />
 18 |         <img class="s3" src="static/images/s3.png" />
 19 |         <img class="box" src="{{ .Site.BaseURL }}static/images/splash.png" alt="listmonk screenshot" />
 20 |       </div>
 21 |   </div>
 22 | </div>
 23 | 
 24 | <section id="download">
 25 |   <div class="container">
 26 |     <h2 class="center">Download</h2>
 27 |     <p class="center">
 28 |       The latest version is <strong>{{ .Page.Site.Data.github.version }}</strong>
 29 |       released on {{ .Page.Site.Data.github.date | dateFormat "02 Jan 2006" }}.
 30 |       See <a href="{{ .Page.Site.Data.github.url }}">release notes.</a>
 31 |     </p><br />
 32 | 
 33 |     <div class="row">
 34 |       <div class="col-6">
 35 |         <div class="box">
 36 |           <h3>Binary</h3>
 37 |           <ul class="install-steps">
 38 |             <li class="download-links">Download binary:<br />
 39 |               {{ range.Page.Site.Data.github.assets }}
 40 |                 <a href="{{ .url }}">{{ .name | title }}</a>
 41 |               {{ end }}
 42 |             </li>
 43 |             <li>
 44 |               <code>./listmonk --new-config</code> to generate config.toml. Edit it.
 45 |             </li>
 46 |             <li><code>./listmonk --install</code> to setup the Postgres DB or <code>--upgrade</code> to upgrade an existing DB.</li>
 47 |             <li>Run <code>./listmonk</code> and visit <code>http://localhost:9000</code></li>
 48 |           </ul>
 49 |           <p><a href="/docs/installation">Installation docs &rarr;</a></p>
 50 | 
 51 |           <br />
 52 |           <h3>Hosting providers</h3>
 53 |           <a href="https://railway.app/new/template/listmonk"><img src="https://railway.app/button.svg" alt="One-click deploy on Railway" style="max-height: 32px;" /></a>
 54 |           <br />
 55 |           <a href="https://www.pikapods.com/pods?run=listmonk"><img src="https://www.pikapods.com/static/run-button.svg" alt="Deploy on PikaPod" /></a>
 56 |           <br />
 57 |           <a href="https://dash.elest.io/deploy?soft=Listmonk&id=237"><img height="33" src="https://github.com/elestio-examples/wordpress/raw/main/deploy-on-elestio.png" alt="Deploy on Elestio" /></a>
 58 |           <br />
 59 |           <a href="https://zeabur.com/templates/5EDMN6"><img width="148" src="https://zeabur.com/button.svg" alt="Deploy on Zeabur"/></a>
 60 |           <p><small>*listmonk has no affiliation with any of these providers.</small></p>
 61 |         </div>
 62 |       </div>
 63 |       <div class="col-6">
 64 |         <div class="box">
 65 |           <h3>Docker</h3>
 66 |           <p><a href="https://hub.docker.com/r/listmonk/listmonk/tags?page=1&ordering=last_updated&name=latest"><code>listmonk/listmonk:latest</code></a></p>
 67 |           <p>
 68 |             Download and use the sample <a href="https://github.com/knadh/listmonk/blob/master/docker-compose.yml">docker-compose.yml</a> 
 69 |           </p>
 70 | 
 71 | <pre>
 72 | # Download the compose file to the current directory.
 73 | curl -LO https://github.com/knadh/listmonk/raw/master/docker-compose.yml
 74 | 
 75 | # Run the services in the background.
 76 | docker compose up -d
 77 | </pre>
 78 |           <p>Visit <code>http://localhost:9000</code></p>
 79 | 
 80 |           <p><a href="/docs/installation">Installation docs &rarr;</a></p>
 81 |         </div>
 82 |       </div>
 83 |     </div>
 84 |   </div>
 85 | </section>
 86 | 
 87 | <div class="container">
 88 |   <section class="lists feature">
 89 |     <h2>One-way mailing lists</h2>
 90 |     <div class="center">
 91 |       <img class="box" src="static/images/lists.png" alt="Screenshot of list management feature" />
 92 |     </div>
 93 |     <p>
 94 |       Manage millions of subscribers across many single and double opt-in one-way mailing lists
 95 |       with custom JSON attributes for each subscriber.
 96 |       Query and segment subscribers with SQL expressions.
 97 |     </p>
 98 |     <p>Use the fast bulk importer (~10k records per second) or use HTTP/JSON APIs or interact with the simple
 99 |       table schema to integrate external CRMs and subscriber databases.
100 |     </p>
101 |   </section>
102 | 
103 |   <section class="tx feature">
104 |     <h2>Transactional mails</h2>
105 |     <div class="center">
106 |       <img class="box" src="static/images/tx.png" alt="Screenshot of transactional API" />
107 |     </div>
108 |     <p>
109 |       Simple API to send arbitrary transactional messages to subscribers
110 |       using pre-defined templates. Send messages as e-mail, SMS, Whatsapp messages or any medium via Messenger interfaces.
111 |     </p>
112 |   </section>
113 | 
114 |   <section class="media feature">
115 |     <h2>Analytics</h2>
116 |     <div class="center">
117 |       <img class="box" src="static/images/analytics.png" alt="Screenshot of analytics feature" />
118 |     </div>
119 |     <p class="center">
120 |       Simple analytics and visualizations. Connect external visualization programs to the database easily with the simple table structure.
121 |     </p>
122 |   </section>
123 | 
124 |   <section class="templating feature">
125 |     <h2>Templating</h2>
126 |     <div class="center">
127 |       <img class="box" src="static/images/templating.png" alt="Screenshot of templating feature" />
128 |     </div>
129 |       <p>
130 |         Create powerful, dynamic e-mail templates with the <a href="https://golang.org/pkg/text/template/">Go templating language</a>.
131 |         Use template expressions, logic, and 100+ functions in subject lines and content.
132 |         Write HTML e-mails in a WYSIWYG editor, Markdown, raw syntax-highlighted HTML, or just plain text.
133 |       </p>
134 |   </section>
135 | 
136 |   <section class="performance feature">
137 |     <h2>Performance</h2>
138 |     <div class="center">
139 |       <figure class="box">
140 |         <img src="static/images/performance.png" alt="Screenshot of performance metrics" />
141 | 
142 |         <figcaption>
143 |           A production listmonk instance sending a campaign of 7+ million e-mails.<br />
144 |           CPU usage is a fraction of a single core with peak RAM usage of 57 MB.
145 |         </figcaption>
146 |       </figure>
147 |     </div>
148 |     <br />
149 |     <p>
150 |       Multi-threaded, high-throughput, multi-SMTP e-mail queues.
151 |       Throughput and sliding window rate limiting for fine grained control.  
152 |       Single binary application with nominal CPU and memory footprint that runs everywhere.
153 |       The only dependency is a Postgres (⩾ 12) database.
154 |     </p>
155 |   </section>
156 | 
157 |   <section class="media feature">
158 |     <h2>Media</h2>
159 |     <div class="center">
160 |       <img class="box" src="static/images/media.png" alt="Screenshot of media feature" />
161 |     </div>
162 |     <p class="center">Use the media manager to upload images for e-mail campaigns
163 |       on the server's filesystem, Amazon S3, or any S3 compatible (Minio) backend.</p>
164 |   </section>
165 | 
166 |   <section class="lists feature">
167 |     <h2>Extensible</h2>
168 |     <div class="center">
169 |       <img class="box" src="static/images/messengers.png" alt="Screenshot of Messenger feature" />
170 |     </div>
171 |     <p class="center">
172 |       More than just e-mail campaigns. Connect HTTP webhooks to send SMS,
173 |       Whatsapp, FCM notifications, or any type of messages.
174 |     </p>
175 |   </section>
176 | 
177 |   <section class="privacy feature">
178 |     <h2>Privacy</h2>
179 |     <div class="center">
180 |       <img class="box" src="static/images/privacy.png" alt="Screenshot of privacy features" />
181 |     </div>
182 |     <p class="center">
183 |       Allow subscribers to permanently blocklist themselves, export all their data,
184 |       and to wipe all their data in a single click.
185 |     </p>
186 |   </section>
187 | 
188 |   <h2 class="center">and a lot more &hellip;</h2>
189 | 
190 |   <div class="center">
191 |     <br />
192 |     <a href="#download" class="button">Download</a>
193 |   </div>
194 | 
195 |   <section class="banner">
196 |     <div class="row">
197 |       <div class="col-2">&nbsp;</div>
198 |       <div class="col-8">
199 |         <div class="confetti">
200 |           <img class="s2" src="static/images/s3.png" />
201 |           <div class="box">
202 |             <h2>Developers</h2>
203 |             <p>
204 |               listmonk is free and open source software licensed under AGPLv3.
205 |               If you are interested in contributing, check out the <a href="https://github.com/knadh/listmonk">GitHub repository</a>
206 |               and refer to the <a href="/docs/developer-setup">developer setup</a>.
207 |               The backend is written in Go and the frontend is Vue with Buefy for UI. 
208 |             </p>
209 |           </div>
210 |         </div>
211 |       </div>
212 |       <div class="col-2">&nbsp;</div>
213 |     </div>
214 |   </section>
215 | </div>
216 | 
217 | {{ partial "footer.html" }}
218 | 


--------------------------------------------------------------------------------
/docs/site/layouts/page/single.html:
--------------------------------------------------------------------------------
1 | {{ partial "header" . }}
2 | <article class="page">
3 | 	<h1>{{ .Title }}</h1> 
4 | 	{{ .Content }}
5 | </article>
6 | {{ partial "footer" }}


--------------------------------------------------------------------------------
/docs/site/layouts/partials/footer.html:
--------------------------------------------------------------------------------
 1 | 
 2 |   <div class="container">
 3 |     <footer class="footer">
 4 |       &copy; 2019-{{ now.Format "2006" }} / <a href="https://nadh.in">Kailash Nadh</a>
 5 |     </footer>
 6 |   </div>
 7 | 
 8 |   <script async defer src="https://buttons.github.io/buttons.js"></script>
 9 | </body>
10 | </html>
11 | 


--------------------------------------------------------------------------------
/docs/site/layouts/partials/header.html:
--------------------------------------------------------------------------------
 1 | <!DOCTYPE html>
 2 | <html>
 3 | <head>
 4 |   <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
 5 |   <title>{{ .Title }}</title>
 6 |   <meta name="description" content="{{with .Description }}{{ . }}{{else}}Send e-mail campaigns and transactional e-mails. High performance and features packed into one app.{{end}}" />
 7 |   <meta name="keywords" content="{{ if .Keywords }}{{ range .Keywords }}{{ . }}, {{ end }}{{else if isset .Params "tags" }}{{ range .Params.tags }}{{ . }}, {{ end }}{{end}}">
 8 |   <link rel="canonical" href="{{ .Permalink }}">
 9 |   <link href="https://fonts.googleapis.com/css?family=Inter:400,600" rel="stylesheet">
10 |   <link href="{{ .Site.BaseURL }}static/base.css" rel="stylesheet" type="text/css" />
11 |   <link href="{{ .Site.BaseURL }}static/style.css" rel="stylesheet" type="text/css" />
12 | 
13 |   <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
14 |   <link rel="icon" href="{{ .Site.BaseURL }}static/images/favicon.png" type="image/png" />
15 | 
16 |   <meta property="og:title" content="{{ .Title }}" />
17 |   {{ if .Params.thumbnail }}
18 |     <link rel="image_src" href="{{ .Site.BaseURL }}static/images/{{ .Params.thumbnail }}" />
19 |     <meta property="og:image" content="{{ .Site.BaseURL }}static/images/{{ .Params.thumbnail }}" />
20 |   {{ else }}
21 |     <link rel="image_src" href="{{ .Site.BaseURL }}static/images/thumbnail.png" />
22 |     <meta property="og:image" content="{{ .Site.BaseURL }}static/images/thumbnail.png" />
23 |   {{ end }}
24 | </head>
25 | <body>
26 | 
27 | <div class="container">
28 |   <header class="header">
29 |     <div class="row">
30 |       <div class="col-2 logo">
31 |         <a href="{{ .Site.BaseURL }}"><img src="{{ .Site.BaseURL }}static/images/logo.svg" alt="Listmonk logo" /></a>
32 |       </div>
33 |       <nav class="col-10">
34 |         <a class="item" href="/#download">Download</a>
35 |         <a class="item" href="/docs">Docs</a>
36 |         <div class="github-btn">
37 |           <a class="github-button" href="https://github.com/knadh/listmonk" data-size="large" data-show-count="true" aria-label="knadh/listmonk on GitHub">GitHub</a>
38 |         </div>
39 |       </nav>
40 |     </div>
41 |   </header>
42 | </div>
43 | 


--------------------------------------------------------------------------------
/docs/site/layouts/shortcodes/centered.html:
--------------------------------------------------------------------------------
1 | <section class="row">
2 | 	<div class="col2">&nbsp;</div>
3 | 	<div class="col8">{{ .Inner }}</div>
4 | 	<div class="clear"> </div>
5 | </section>


--------------------------------------------------------------------------------
/docs/site/layouts/shortcodes/github.html:
--------------------------------------------------------------------------------
 1 | <ul id="github" class="no">
 2 |     {{ range .Page.Site.Data.github }}
 3 |         <li class="row">
 4 |             <div class="col2">
 5 |                 <span class="date">{{ dateFormat "Jan 2006" (substr .updated_at 0 10) }}</span>
 6 |             </div>
 7 |             <div class="col3">
 8 |                 <a href="{{ .url }}">{{ .name }}</a>
 9 |             </div>
10 |             <div class="col7 last">
11 |                 <span class="desc">{{ .description }}</span>
12 |             </div>
13 |             <div class="clear"> </div>
14 |         </li>
15 |     {{ end }}
16 | </ul>
17 | <div class="clear"> </div>


--------------------------------------------------------------------------------
/docs/site/layouts/shortcodes/half.html:
--------------------------------------------------------------------------------
1 | <div class="row">
2 | 	<div class="col7">{{ .Inner }}</div>
3 | 	<div class="clear"> </div>
4 | </div>


--------------------------------------------------------------------------------
/docs/site/layouts/shortcodes/section.html:
--------------------------------------------------------------------------------
1 | <section>
2 | 	{{ .Inner }}
3 | </section>


--------------------------------------------------------------------------------
/docs/site/static/static/base.css:
--------------------------------------------------------------------------------
  1 | /**
  2 | *** SIMPLE GRID
  3 | *** (C) ZACH COLE 2016
  4 | **/
  5 | 
  6 | 
  7 | /* UNIVERSAL */
  8 | 
  9 | html,
 10 | body {
 11 |   height: 100%;
 12 |   width: 100%;
 13 |   margin: 0;
 14 |   padding: 0;
 15 |   left: 0;
 16 |   top: 0;
 17 |   font-size: 100%;
 18 | }
 19 | 
 20 | .right {
 21 |   text-align: right;
 22 | }
 23 | 
 24 | .center {
 25 |   text-align: center;
 26 |   margin-left: auto;
 27 |   margin-right: auto;
 28 | }
 29 | 
 30 | .justify {
 31 |   text-align: justify;
 32 | }
 33 | 
 34 | /* ==== GRID SYSTEM ==== */
 35 | 
 36 | .container {
 37 |   margin-left: auto;
 38 |   margin-right: auto;
 39 | }
 40 | 
 41 | .row {
 42 |   position: relative;
 43 |   width: 100%;
 44 | }
 45 | 
 46 | .row [class^="col"] {
 47 |   float: left;
 48 |   margin: 0.5rem 2%;
 49 |   min-height: 0.125rem;
 50 | }
 51 | 
 52 | .col-1,
 53 | .col-2,
 54 | .col-3,
 55 | .col-4,
 56 | .col-5,
 57 | .col-6,
 58 | .col-7,
 59 | .col-8,
 60 | .col-9,
 61 | .col-10,
 62 | .col-11,
 63 | .col-12 {
 64 |   width: 96%;
 65 | }
 66 | 
 67 | .col-1-sm {
 68 |   width: 4.33%;
 69 | }
 70 | 
 71 | .col-2-sm {
 72 |   width: 12.66%;
 73 | }
 74 | 
 75 | .col-3-sm {
 76 |   width: 21%;
 77 | }
 78 | 
 79 | .col-4-sm {
 80 |   width: 29.33%;
 81 | }
 82 | 
 83 | .col-5-sm {
 84 |   width: 37.66%;
 85 | }
 86 | 
 87 | .col-6-sm {
 88 |   width: 46%;
 89 | }
 90 | 
 91 | .col-7-sm {
 92 |   width: 54.33%;
 93 | }
 94 | 
 95 | .col-8-sm {
 96 |   width: 62.66%;
 97 | }
 98 | 
 99 | .col-9-sm {
100 |   width: 71%;
101 | }
102 | 
103 | .col-10-sm {
104 |   width: 79.33%;
105 | }
106 | 
107 | .col-11-sm {
108 |   width: 87.66%;
109 | }
110 | 
111 | .col-12-sm {
112 |   width: 96%;
113 | }
114 | 
115 | .row::after {
116 |   content: "";
117 |   display: table;
118 |   clear: both;
119 | }
120 | 
121 | .hidden-sm {
122 |   display: none;
123 | }
124 | 
125 | @media only screen and (min-width: 33.75em) {  /* 540px */
126 |   .container {
127 |     width: 80%;
128 |   }
129 | }
130 | 
131 | @media only screen and (min-width: 45em) {  /* 720px */
132 |   .col-1 {
133 |     width: 4.33%;
134 |   }
135 | 
136 |   .col-2 {
137 |     width: 12.66%;
138 |   }
139 | 
140 |   .col-3 {
141 |     width: 21%;
142 |   }
143 | 
144 |   .col-4 {
145 |     width: 29.33%;
146 |   }
147 | 
148 |   .col-5 {
149 |     width: 37.66%;
150 |   }
151 | 
152 |   .col-6 {
153 |     width: 46%;
154 |   }
155 | 
156 |   .col-7 {
157 |     width: 54.33%;
158 |   }
159 | 
160 |   .col-8 {
161 |     width: 62.66%;
162 |   }
163 | 
164 |   .col-9 {
165 |     width: 71%;
166 |   }
167 | 
168 |   .col-10 {
169 |     width: 79.33%;
170 |   }
171 | 
172 |   .col-11 {
173 |     width: 87.66%;
174 |   }
175 | 
176 |   .col-12 {
177 |     width: 96%;
178 |   }
179 | 
180 |   .hidden-sm {
181 |     display: block;
182 |   }
183 | }
184 | 
185 | @media only screen and (min-width: 60em) { /* 960px */
186 |   .container {
187 |     width: 75%;
188 |     max-width: 60rem;
189 |   }
190 | }
191 | 


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/2022-07-31_19-07.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/2022-07-31_19-08.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/analytics.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/favicon.png


--------------------------------------------------------------------------------
  1 | <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  2 | <svg
  3 |    xmlns:dc="http://purl.org/dc/elements/1.1/"
  4 |    xmlns:cc="http://creativecommons.org/ns#"
  5 |    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  6 |    xmlns:svg="http://www.w3.org/2000/svg"
  7 |    xmlns="http://www.w3.org/2000/svg"
  8 |    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
  9 |    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
 10 |    width="45.041653mm"
 11 |    height="9.8558731mm"
 12 |    viewBox="0 0 45.041653 9.8558733"
 13 |    version="1.1"
 14 |    id="svg8"
 15 |    sodipodi:docname="listmonk.src.svg"
 16 |    inkscape:version="1.0 (9f2f71dc58, 2020-08-02)">
 17 |   <defs
 18 |      id="defs2" />
 19 |   <sodipodi:namedview
 20 |      id="base"
 21 |      pagecolor="#ffffff"
 22 |      bordercolor="#666666"
 23 |      borderopacity="1.0"
 24 |      inkscape:pageopacity="0.0"
 25 |      inkscape:pageshadow="2"
 26 |      inkscape:zoom="1"
 27 |      inkscape:cx="742.82396"
 28 |      inkscape:cy="-93.302628"
 29 |      inkscape:document-units="mm"
 30 |      inkscape:current-layer="layer1"
 31 |      showgrid="false"
 32 |      inkscape:window-width="1863"
 33 |      inkscape:window-height="1025"
 34 |      inkscape:window-x="57"
 35 |      inkscape:window-y="27"
 36 |      inkscape:window-maximized="1"
 37 |      fit-margin-top="0"
 38 |      fit-margin-left="0"
 39 |      fit-margin-right="0"
 40 |      fit-margin-bottom="0"
 41 |      inkscape:document-rotation="0" />
 42 |   <metadata
 43 |      id="metadata5">
 44 |     <rdf:RDF>
 45 |       <cc:Work
 46 |          rdf:about="">
 47 |         <dc:format>image/svg+xml</dc:format>
 48 |         <dc:type
 49 |            rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
 50 |         <dc:title />
 51 |       </cc:Work>
 52 |     </rdf:RDF>
 53 |   </metadata>
 54 |   <g
 55 |      inkscape:label="Layer 1"
 56 |      inkscape:groupmode="layer"
 57 |      id="layer1"
 58 |      transform="translate(-12.438455,-21.535559)">
 59 |     <path
 60 |        style="fill:#ffcc00;fill-opacity:1;stroke:none;stroke-width:2.11094689;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
 61 |        d="m 16.660914,21.535559 a 4.2220837,4.2220837 0 0 0 -4.222459,4.222437 4.2220837,4.2220837 0 0 0 0.490699,1.968681 c 0.649637,-1.386097 2.059696,-2.343758 3.73176,-2.343758 1.672279,0 3.082188,0.958029 3.731731,2.344413 a 4.2220837,4.2220837 0 0 0 0.490039,-1.969336 4.2220837,4.2220837 0 0 0 -4.22177,-4.222437 z"
 62 |        id="circle920"
 63 |        inkscape:connector-curvature="0"
 64 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
 65 |        inkscape:export-xdpi="96"
 66 |        inkscape:export-ydpi="96" />
 67 |     <flowRoot
 68 |        xml:space="preserve"
 69 |        id="flowRoot935"
 70 |        style="font-style:normal;font-weight:normal;font-size:40px;line-height:1.25;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none"
 71 |        transform="matrix(0.27888442,0,0,0.27888442,92.852428,101.67857)"><flowRegion
 72 |          id="flowRegion937"><rect
 73 |            id="rect939"
 74 |            width="338"
 75 |            height="181"
 76 |            x="-374"
 77 |            y="-425.36423" /></flowRegion><flowPara
 78 |          id="flowPara941" /></flowRoot>
 79 |     <text
 80 |        id="text874-8"
 81 |        y="30.29347"
 82 |        x="23.133614"
 83 |        style="font-style:normal;font-variant:normal;font-weight:500;font-stretch:normal;font-size:8.70789px;line-height:1.25;font-family:'IBM Plex Sans';-inkscape-font-specification:'IBM Plex Sans, Medium';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.0459737"
 84 |        xml:space="preserve"
 85 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
 86 |        inkscape:export-xdpi="96"
 87 |        inkscape:export-ydpi="96"><tspan
 88 |          style="font-style:normal;font-variant:normal;font-weight:600;font-stretch:normal;font-size:8.70789px;font-family:Inter;-inkscape-font-specification:'Inter Semi-Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:0.0459737"
 89 |          y="30.29347"
 90 |          x="23.133614"
 91 |          id="tspan872-0"
 92 |          sodipodi:role="line">listmonk</tspan></text>
 93 |     <circle
 94 |        r="3.1873188"
 95 |        cy="27.647591"
 96 |        cx="16.66629"
 97 |        id="circle876-1"
 98 |        style="fill:none;fill-opacity:1;stroke:#7f2aff;stroke-width:1.11304522;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
 99 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
100 |        inkscape:export-xdpi="96"
101 |        inkscape:export-ydpi="96" />
102 |     <path
103 |        inkscape:connector-curvature="0"
104 |        id="path878-0"
105 |        d="m 16.666291,24.813242 a 3.1873187,3.8372081 0 0 0 -3.187196,3.837044 3.1873187,3.8372081 0 0 0 0.07347,0.79818 3.1873187,3.8372081 0 0 1 3.113724,-3.027362 3.1873187,3.8372081 0 0 1 3.113721,3.038883 3.1873187,3.8372081 0 0 0 0.07347,-0.809701 3.1873187,3.8372081 0 0 0 -3.187196,-3.837044 z"
106 |        style="fill:#7f2aff;fill-opacity:1;stroke:none;stroke-width:1.22125876;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
107 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
108 |        inkscape:export-xdpi="96"
109 |        inkscape:export-ydpi="96" />
110 |     <path
111 |        style="fill:#ffcc00;fill-opacity:1;stroke:none;stroke-width:1.06017;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
112 |        d="m 139.94612,-53.327122 a 2.1703097,2.0716912 0 0 0 -2.17051,2.071864 2.1703097,2.0716912 0 0 0 0.25224,0.965993 c 0.33394,-0.680131 1.05876,-1.150035 1.91827,-1.150035 0.85961,0 1.58436,0.470085 1.91825,1.150356 a 2.1703097,2.0716912 0 0 0 0.2519,-0.966314 2.1703097,2.0716912 0 0 0 -2.17015,-2.071864 z"
113 |        id="path1200"
114 |        inkscape:connector-curvature="0"
115 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
116 |        inkscape:export-xdpi="96"
117 |        inkscape:export-ydpi="96" />
118 |     <text
119 |        id="text1204"
120 |        y="-46.771812"
121 |        x="116.91617"
122 |        style="font-style:normal;font-variant:normal;font-weight:500;font-stretch:normal;font-size:8.70789px;line-height:1.25;font-family:'IBM Plex Sans';-inkscape-font-specification:'IBM Plex Sans, Medium';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.0459737"
123 |        xml:space="preserve"
124 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
125 |        inkscape:export-xdpi="96"
126 |        inkscape:export-ydpi="96"><tspan
127 |          style="font-style:normal;font-variant:normal;font-weight:600;font-stretch:normal;font-size:8.70789px;font-family:Inter;-inkscape-font-specification:'Inter Semi-Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:0.0459737"
128 |          y="-46.771812"
129 |          x="116.91617"
130 |          id="tspan1202"
131 |          sodipodi:role="line">listmonk</tspan></text>
132 |     <text
133 |        id="text1214"
134 |        y="-23.851294"
135 |        x="127.87717"
136 |        style="font-style:normal;font-variant:normal;font-weight:500;font-stretch:normal;font-size:6.82489px;line-height:1.25;font-family:'IBM Plex Sans';-inkscape-font-specification:'IBM Plex Sans, Medium';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.0360324"
137 |        xml:space="preserve"
138 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
139 |        inkscape:export-xdpi="96"
140 |        inkscape:export-ydpi="96"><tspan
141 |          style="font-style:normal;font-variant:normal;font-weight:600;font-stretch:normal;font-size:6.82489px;font-family:Inter;-inkscape-font-specification:'Inter Semi-Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:0.0360324"
142 |          y="-23.851294"
143 |          x="127.87717"
144 |          id="tspan1212"
145 |          sodipodi:role="line">listmonk</tspan></text>
146 |     <circle
147 |        style="fill:#ffcc00;fill-opacity:1;stroke:none;stroke-width:2.5729"
148 |        id="path1216"
149 |        cx="203.43507"
150 |        cy="-21.854498"
151 |        r="3.8091576" />
152 |     <g
153 |        id="g1239"
154 |        transform="matrix(1.2398232,0,0,1.2398232,25.599078,-34.522694)">
155 |       <rect
156 |          style="fill:#7f2aff;fill-opacity:1;stroke:none;stroke-width:0.91563"
157 |          id="rect1218"
158 |          width="3.7532511"
159 |          height="0.89233136"
160 |          x="77.048592"
161 |          y="4.6184554" />
162 |       <rect
163 |          style="fill:#7f2aff;fill-opacity:1;stroke:none;stroke-width:0.91563"
164 |          id="rect1220"
165 |          width="3.7532511"
166 |          height="0.89233136"
167 |          x="77.048592"
168 |          y="6.1939058" />
169 |       <rect
170 |          style="fill:#7f2aff;fill-opacity:1;stroke:none;stroke-width:0.91563"
171 |          id="rect1226"
172 |          width="3.7532511"
173 |          height="0.89233136"
174 |          x="77.048592"
175 |          y="7.7760162" />
176 |     </g>
177 |     <ellipse
178 |        style="fill:#ffcc00;fill-opacity:1;stroke:none;stroke-width:1.5875"
179 |        id="path1247"
180 |        cx="139.2197"
181 |        cy="-74.271935"
182 |        rx="2.1283948"
183 |        ry="1.9833959" />
184 |     <text
185 |        id="text1245"
186 |        y="-71.648537"
187 |        x="115.96989"
188 |        style="font-style:normal;font-variant:normal;font-weight:500;font-stretch:normal;font-size:8.70789px;line-height:1.25;font-family:'IBM Plex Sans';-inkscape-font-specification:'IBM Plex Sans, Medium';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.0459737"
189 |        xml:space="preserve"
190 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
191 |        inkscape:export-xdpi="96"
192 |        inkscape:export-ydpi="96"><tspan
193 |          style="font-style:normal;font-variant:normal;font-weight:600;font-stretch:normal;font-size:8.70789px;font-family:Inter;-inkscape-font-specification:'Inter Semi-Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:0.0459737"
194 |          y="-71.648537"
195 |          x="115.96989"
196 |          id="tspan1243"
197 |          sodipodi:role="line">listmonk</tspan></text>
198 |     <text
199 |        id="text1042"
200 |        y="-18.770809"
201 |        x="210.12352"
202 |        style="font-style:normal;font-variant:normal;font-weight:500;font-stretch:normal;font-size:8.70789px;line-height:1.25;font-family:'IBM Plex Sans';-inkscape-font-specification:'IBM Plex Sans, Medium';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;letter-spacing:-0.0529167px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.0459737"
203 |        xml:space="preserve"
204 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
205 |        inkscape:export-xdpi="96"
206 |        inkscape:export-ydpi="96"><tspan
207 |          style="font-style:normal;font-variant:normal;font-weight:600;font-stretch:normal;font-size:8.70789px;font-family:'Fira Sans';-inkscape-font-specification:'Fira Sans Semi-Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:0.0459737"
208 |          y="-18.770809"
209 |          x="210.12352"
210 |          id="tspan1040"
211 |          sodipodi:role="line">listmonk</tspan></text>
212 |     <circle
213 |        style="fill:none;fill-opacity:1;stroke:#ffcc00;stroke-width:1.73982;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
214 |        id="circle1737"
215 |        cx="203.74388"
216 |        cy="-1.1837244"
217 |        r="3.1489604" />
218 |     <text
219 |        id="text1741"
220 |        y="2.24283"
221 |        x="210.38811"
222 |        style="font-style:normal;font-variant:normal;font-weight:500;font-stretch:normal;font-size:8.70789px;line-height:1.25;font-family:'IBM Plex Sans';-inkscape-font-specification:'IBM Plex Sans, Medium';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;letter-spacing:-0.0529167px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.0459737"
223 |        xml:space="preserve"
224 |        inkscape:export-filename="/home/kailash/Site/listmonk/static/logo.png"
225 |        inkscape:export-xdpi="96"
226 |        inkscape:export-ydpi="96"><tspan
227 |          style="font-style:normal;font-variant:normal;font-weight:600;font-stretch:normal;font-size:8.70789px;font-family:'Fira Sans';-inkscape-font-specification:'Fira Sans Semi-Bold';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:0.0459737"
228 |          y="2.24283"
229 |          x="210.38811"
230 |          id="tspan1739"
231 |          sodipodi:role="line">listmonk</tspan></text>
232 |   </g>
233 | </svg>
234 | 


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/lists.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/logo.png


--------------------------------------------------------------------------------
1 | <svg xmlns="http://www.w3.org/2000/svg" width="163.03" height="30.38" viewBox="0 0 43.135 8.038" xmlns:v="https://vecta.io/nano"><circle cx="4.019" cy="4.019" r="3.149" fill="none" stroke="#0055d4" stroke-width="1.74"/><path d="M11.457 7.303q-.566 0-.879-.322-.313-.331-.313-.932V.712L11.5.572v5.442q0 .305.253.305.139 0 .244-.052l.253.879q-.357.157-.792.157zm2.619-4.754v4.615H12.84V2.549zM13.449.172q.331 0 .54.209.218.2.218.514 0 .313-.218.522-.209.2-.54.2-.331 0-.54-.2-.209-.209-.209-.522 0-.313.209-.514.209-.209.54-.209zm3.319 2.238q.975 0 1.672.557l-.47.705q-.583-.366-1.149-.366-.305 0-.47.113-.165.113-.165.305 0 .139.07.235.078.096.279.183.209.087.618.209.731.2 1.088.54.357.331.357.914 0 .462-.27.801-.261.34-.714.522-.453.174-1.01.174-.583 0-1.062-.174-.479-.183-.819-.496l.61-.679q.583.453 1.237.453.348 0 .549-.131.209-.139.209-.374 0-.183-.078-.287-.078-.104-.287-.192-.209-.096-.653-.218-.697-.192-1.036-.54-.331-.357-.331-.879 0-.392.226-.705.226-.313.636-.488.418-.183.967-.183zm5.342 4.536q-.253.174-.575.261-.313.096-.627.096-.714-.009-1.08-.409-.366-.401-.366-1.176V3.42h-.688v-.871h.688v-1.01l1.237-.148v1.158h1.062l-.122.871h-.94v2.273q0 .331.113.479.113.148.348.148.235 0 .522-.157zm5.493-4.536q.549 0 .879.374.34.374.34 1.019v3.361h-1.237V4.012q0-.679-.453-.679-.244 0-.427.157-.183.157-.374.488v3.187h-1.237V4.012q0-.679-.453-.679-.244 0-.427.165-.183.157-.366.479v3.187h-1.237V2.549h1.071l.096.575q.261-.348.583-.531.331-.183.758-.183.392 0 .679.2.287.192.418.549.287-.374.618-.557.34-.192.766-.192zm4.148 0q1.036 0 1.62.653.583.644.583 1.794 0 .731-.27 1.289-.261.549-.766.853-.496.305-1.176.305-1.036 0-1.628-.644-.583-.653-.583-1.803 0-.731.261-1.28.27-.557.766-.862.505-.305 1.193-.305zm0 .923q-.47 0-.705.374-.226.366-.226 1.149 0 .784.226 1.158.235.366.697.366.462 0 .688-.366.235-.374.235-1.158 0-.784-.226-1.149-.226-.374-.688-.374zm5.271-.923q.61 0 .949.374.34.366.34 1.019v3.361h-1.237V4.012q0-.374-.131-.522-.122-.157-.374-.157-.261 0-.479.165-.209.157-.409.479v3.187h-1.237V2.549h1.071l.096.583q.287-.357.627-.54.348-.183.784-.183zM40.2.572v6.592h-1.237V.712zm2.804 1.977l-1.472 2.029 1.602 2.586h-1.402l-1.489-2.525 1.48-2.09z"/></svg>


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/media.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/messengers.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/performance.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/privacy.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/s1.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/s2.png


--------------------------------------------------------------------------------
 1 | <?xml version="1.0" encoding="UTF-8" standalone="no"?>
 2 | <svg
 3 |    xmlns:dc="http://purl.org/dc/elements/1.1/"
 4 |    xmlns:cc="http://creativecommons.org/ns#"
 5 |    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
 6 |    xmlns:svg="http://www.w3.org/2000/svg"
 7 |    xmlns="http://www.w3.org/2000/svg"
 8 |    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
 9 |    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
10 |    version="1.1"
11 |    id="svg1065"
12 |    width="21.1164"
13 |    height="17.646732"
14 |    viewBox="0 0 21.1164 17.646732"
15 |    sodipodi:docname="s2.svg"
16 |    inkscape:export-filename="/home/kailash/www/listmonk/site/static/static/images/s2.png"
17 |    inkscape:export-xdpi="115.86"
18 |    inkscape:export-ydpi="115.86"
19 |    inkscape:version="1.0.2 (e86c870879, 2021-01-15)">
20 |   <metadata
21 |      id="metadata1071">
22 |     <rdf:RDF>
23 |       <cc:Work
24 |          rdf:about="">
25 |         <dc:format>image/svg+xml</dc:format>
26 |         <dc:type
27 |            rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
28 |         <dc:title></dc:title>
29 |       </cc:Work>
30 |     </rdf:RDF>
31 |   </metadata>
32 |   <defs
33 |      id="defs1069">
34 |     <inkscape:path-effect
35 |        effect="fillet_chamfer"
36 |        id="path-effect1698"
37 |        is_visible="true"
38 |        lpeversion="1"
39 |        satellites_param="F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1 @ F,0,0,1,0,0,0,1"
40 |        unit="px"
41 |        method="auto"
42 |        mode="IC"
43 |        radius="10"
44 |        chamfer_steps="1"
45 |        flexible="false"
46 |        use_knot_distance="false"
47 |        apply_no_radius="false"
48 |        apply_with_radius="false"
49 |        only_selected="false"
50 |        hide_knots="false" />
51 |   </defs>
52 |   <sodipodi:namedview
53 |      pagecolor="#ffffff"
54 |      bordercolor="#666666"
55 |      borderopacity="1"
56 |      objecttolerance="10"
57 |      gridtolerance="10"
58 |      guidetolerance="10"
59 |      inkscape:pageopacity="0"
60 |      inkscape:pageshadow="2"
61 |      inkscape:window-width="1920"
62 |      inkscape:window-height="1007"
63 |      id="namedview1067"
64 |      showgrid="false"
65 |      inkscape:zoom="4"
66 |      inkscape:cx="28.817195"
67 |      inkscape:cy="14.597549"
68 |      inkscape:window-x="0"
69 |      inkscape:window-y="0"
70 |      inkscape:window-maximized="1"
71 |      inkscape:current-layer="g1073" />
72 |   <g
73 |      inkscape:groupmode="layer"
74 |      inkscape:label="Image"
75 |      id="g1073"
76 |      transform="translate(-4.4667969,-5.166384)">
77 |     <path
78 |        style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-variant-east-asian:normal;font-feature-settings:normal;font-variation-settings:normal;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;writing-mode:lr-tb;direction:ltr;text-orientation:mixed;dominant-baseline:auto;baseline-shift:baseline;text-anchor:start;white-space:normal;shape-padding:0;shape-margin:0;inline-size:0;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;vector-effect:none;fill:#0055d4;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:normal;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate;stop-color:#000000;stop-opacity:1"
79 |        d="M 15.923828,5.3164062 C 11.592147,4.6111791 7.0486038,6.4161348 4.4667969,10.228516 c 0,0.53125 0.060547,2.755859 4.1230469,3.224609 1.7958472,-2.651806 5.8189972,-3.5264183 8.5820312,-1.822266 2.837636,1.750166 3.699383,5.385019 1.949219,8.222657 -0.4375,1.71875 2.066406,3.18164 4.753906,2.93164 C 27.209467,17.378802 25.509869,10.211423 20.103516,6.8769531 18.787461,6.0652517 17.367722,5.551482 15.923828,5.3164062 Z"
80 |        id="path1671"
81 |        sodipodi:nodetypes="sccsccss" />
82 |   </g>
83 | </svg>
84 | 


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/s3.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/s4.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/smtp.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/splash.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/templating.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/thumbnail.png


--------------------------------------------------------------------------------
https://raw.githubusercontent.com/knadh/listmonk/master/docs/site/static/static/images/tx.png


--------------------------------------------------------------------------------
/docs/site/static/static/style.css:
--------------------------------------------------------------------------------
  1 | body {
  2 |   background: #fdfdfd;
  3 |   font-family: "Inter", "Helvetica Neue", "Segoe UI", sans-serif;
  4 |   font-size: 17px;
  5 |   font-weight: 400;
  6 |   line-height: 30px;
  7 |   color: #444;
  8 |   overflow-x: hidden;
  9 | }
 10 | 
 11 | 
 12 | h1,
 13 | h2,
 14 | h3,
 15 | h4,
 16 | h5 {
 17 |   font-weight: 600;
 18 |   margin: 5px 0 15px 0;
 19 |   color: #111;
 20 | }
 21 | h1 {
 22 |   font-size: 2.5em;
 23 |   line-height: 1.2em;
 24 |   letter-spacing: -0.01em;
 25 | }
 26 | h2 {
 27 |   font-size: 2em;
 28 |   line-height: 1.4em;
 29 | }
 30 | h3 {
 31 |   font-size: 1.6em;
 32 |   line-height: 1.6em;
 33 | }
 34 | strong {
 35 |   font-weight: 600;
 36 | }
 37 | section:not(:last-child) {
 38 |   margin-bottom: 100px;
 39 | }
 40 | a {
 41 |   color: #0055d4;
 42 |   text-decoration: none;
 43 | }
 44 | a:hover {
 45 |   color: #111;
 46 | }
 47 | ::selection {
 48 |   background: #111;
 49 |   color: #fff;
 50 | }
 51 | pre {
 52 |   background: #fafafa;
 53 |   padding: 5px;
 54 |   border-radius: 3px;
 55 |   overflow-x: scroll;
 56 | }
 57 | code {
 58 |   background: #fafafa;
 59 |   padding: 5px;
 60 |   border-radius: 3px;
 61 | }
 62 | img {
 63 |   max-width: 100%;
 64 | }
 65 | 
 66 | /* Helpers */
 67 | .center {
 68 |   text-align: center;
 69 | }
 70 | .small, code, pre {
 71 |   font-size: 13px;
 72 |   line-height: 20px;
 73 |   color:  #333;
 74 | }
 75 | 
 76 | .box {
 77 |   background: #fff;
 78 |   border-radius: 6px;
 79 |   border: 1px solid #e6e6e6;
 80 |   box-shadow: 1px 1px 4px #e6e6e6;
 81 |   padding: 30px;
 82 | }
 83 | 
 84 | img.box {
 85 |   display: inline-block;
 86 |   padding: 0;
 87 | }
 88 | 
 89 | figcaption {
 90 |   color:  #888;
 91 |   font-size: 0.9em;
 92 | }
 93 | 
 94 | .button {
 95 |   background: #0055d4;
 96 |   display: inline-block;
 97 |   text-align: center;
 98 |   font-weight: 600;
 99 | 
100 |   color: #fff;
101 |   border-radius: 100px;
102 |   padding: 10px 15px;
103 |   min-width: 150px;
104 | }
105 | .button:hover {
106 |   background: #111;
107 |   color: #fff;
108 | }
109 | .notice {
110 |   background: #fafafa;
111 |   border-left: 4px solid #ddd;
112 |   color: #666;
113 |   padding: 5px 15px;
114 | }
115 | 
116 | 
117 | /* Layout */
118 | .container {
119 |   max-width: 1200px;
120 |   margin: 0 auto;
121 | }
122 | .header {
123 |   margin: 30px 0 60px 0;
124 |   text-align: left;
125 | }
126 | 
127 | .logo img {
128 |   width: 125px;
129 |   height: auto;
130 | }
131 | 
132 | nav {
133 |   text-align: right;
134 | }
135 |   nav .item:not(:first-child) {
136 |     margin: 0 0 0 40px;
137 |   }
138 |   .github-btn {
139 |     min-width: 135px;
140 |     min-height: 38px;
141 |     float: right;
142 |     margin-left: 30px;
143 |   }
144 | 
145 | 
146 | .splash .hero {
147 |   margin-bottom: 60px;
148 | }
149 |   .splash .title {
150 |     max-width: 700px;
151 |     margin: 0 auto 30px auto;
152 |     font-size: 3em;
153 |   }
154 |   .splash .sub {
155 |     font-weight: 400;
156 |     color: #666;
157 |   }
158 |   .splash .confetti {
159 |     max-width: 1000px;
160 |     margin: 0 auto;
161 |   }
162 |   .splash .demo {
163 |     margin-top: 30px;
164 |   }
165 | 
166 | .confetti {
167 |   position: relative;
168 | }
169 |   .confetti .s1, .confetti .s2, .confetti .s3 {
170 |     position: absolute;
171 |   }
172 |   .confetti.light .s1, .confetti.light .s2, .confetti.light .s3 {
173 |     opacity: 0.30;
174 |   }
175 |   .confetti .s1 {
176 |     left: -35px;
177 |     top: 20%;
178 |     z-index: 10;
179 |   }
180 |   .confetti .s2 {
181 |     z-index: 30;
182 |     right: 20%;
183 |     top: -12px;
184 |   }
185 |   .confetti .s3 {
186 |     z-index: 30;
187 |     left: 15%;
188 |     bottom: 0;
189 |   }
190 |   .confetti .box {
191 |     position: relative;
192 |     z-index: 20;
193 |   }
194 | 
195 | #download {
196 |   background: #f9f9f9;
197 |   padding: 160px 0 90px 0;
198 |   margin-top: -90px;
199 | }
200 |   #download .install-steps li {
201 |     margin-bottom: 15px;
202 |   }
203 |   #download .download-links a:not(:last-child) {
204 |     display: inline-block;
205 |     margin-right: 15px;
206 |   }
207 |   #download .box {
208 |     min-height: 630px;
209 |   }
210 | 
211 | .feature {
212 | }
213 |   .feature h2 {
214 |     margin-bottom: 1em;
215 |     text-align: center;
216 |   }
217 |   .feature img {
218 |     margin-bottom: 1em;
219 |   }
220 |   .feature p {
221 |     margin-left: auto;
222 |     margin-right: auto;
223 |     max-width: 750px;
224 |   }
225 | 
226 | .banner {
227 |   padding-top: 90px;
228 | }
229 | 
230 | .footer {
231 |   border-top: 1px solid #eee;
232 |   padding-top: 30px;
233 |   margin: 90px 0 30px 0;
234 |   color: #777;
235 | }
236 | 
237 | @media screen and (max-width: 720px) {
238 |   body {
239 |     /*font-size: 16px;*/
240 |   }
241 |   .header {
242 |     margin-bottom: 15px;
243 |     text-align: center;
244 |   }
245 |   .header .columns {
246 |     margin-bottom: 10px;
247 |   }
248 | 
249 |   .box {
250 |     padding: 15px;
251 |   }
252 | 
253 |   .splash .title {
254 |     font-size: 2.1em;
255 |     line-height: 1.3em;
256 |   }
257 | 
258 |   .splash .sub {
259 |     font-size: 1.3em;
260 |     line-height: 1.5em;
261 |   }
262 | 
263 |   nav {
264 |     text-align: center;
265 |   }
266 | 
267 |   .github-btn {
268 |     float: none;
269 |     margin: 15px 0 0 0;
270 |   }
271 | 
272 |   section:not(:last-child) {
273 |     margin-bottom: 45px;
274 |   }
275 | }
276 | @media screen and (max-width: 540px) {
277 |   .container {
278 |     padding: 0 15px;
279 |   }
280 | }