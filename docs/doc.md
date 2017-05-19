Here is need for document

## Document
* Versionning by lang
* name by lang (not case sensitive)
* content (text by lang)
* data_id 

### exemple
```json
{
  "id":123,
  "name": "Hello",
  "namespace": "doc",
  "content":"Hello world",
  "data_id":46487
}
```

```json
{
  "id":465,
  "name": "Hello/Draft",
  "namespace": "doc",
  "content":"Let's say hello",
}
```

## Data
Here is need for data
* Global (not lang related)
* Standalone api
* can't live without a doc
* Id (document.data_id)
* lang/id property 
* [property]
  * where property is a couple name/object
  * where name is a string
  * where object is a number/string/boolean/null/list/object
  
### exemple
```json
{
  "id":46487,
  "namespace":"doc",
  "locale_ids":{
    "fr": 123,
    "en": 122 
    },
  "elevation":4805,
  "associations":{
    "user":[123456,789798],
    "route":[123456,45]
  }
}
```
    
