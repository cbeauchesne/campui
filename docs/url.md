## Url use case

* /{Technical}
  * /api :white_check_mark:
  * /static :white_check_mark:
  * /analytics :white_check_mark:

* /special/{action}
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
  * /{cutom_portal} shortchut to /portal/name :white_check_mark:

* /{namespace}/{document_id}[/sub_page] *page in DB*
  * /route/id :white_check_mark:
  * /waypoint/id :white_check_mark:
  * /user/id :x:
  * /area/id :white_check_mark:
  * /article/id :white_check_mark:
  * /outing/id :white_check_mark:
  * /xreport/id :x:
  * /image/id :x:
  * /book/id :x:
  * /portal/name  :x:
  * /{namespace}/{id_or_name}?discussions
  
* api
  * /api/document?name={namespace/name}[&mode={raw}][&version={id}]
    * GET
    * POST
    * PUT
    * DELETE
