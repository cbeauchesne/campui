## Url use case

* /{Technical}
  * /api :white_check_mark:
  * /static :white_check_mark:
  * /analytics :white_check_mark:
  * /static :white_check_mark:
  * /media :x:

* /{special}
  * /login :white_check_mark:
  * /register :x:
  * /me :white_check_mark:

* /{portal_name}  *direct rendering of a template*
  * /routes :white_check_mark:
  * /waypoints :white_check_mark:
  * /users :white_check_mark:
  * /areas :white_check_mark:
  * /articles :white_check_mark:
  * /users :white_check_mark:
  * /outings :white_check_mark:
  * /xreports :white_check_mark:
  * /stories :white_check_mark:
  * /outing-images :white_check_mark:
  * /images :x:
  * /books :x:
  * /stats :x:
  * /{cutom_portal} :white_check_mark:

* /{this}/{is}/{rules} *page in DB*
  * /route/id :white_check_mark:
  * /waypoint/id :white_check_mark:
  * /user/id :x:
  * /area/id :white_check_mark:
  * /article/id :white_check_mark:
  * /outing/id :white_check_mark:
  * /xreport/id :x:
  * /image/id :x:
  * /book/id :x:
  * /{namespace}/{id_or_name}/discussion
  
* api
  * /document/{name}
    * PUT -> create
    * GET -> no comment
    * POST -> update
    * DELETE -> delete
  * /document/{name}?version={id}
    * GET -> no comment
  * /document/{name}?view=raw
    * GET -> no comment
  * /document/{name}?view=history
    * GET -> no comment
  * /recentchanges
    * GET -> no comment