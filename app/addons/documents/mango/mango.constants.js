export default {
  INDEX_TEMPLATES: [{
    label: 'Single field (json)',
    code: {
      "index": {
        "fields": ["foo"]
      },
      "name": "foo-json-index",
      "type" : "json"
    }
  }, {
    label: 'Multiple fields (json)',
    code: {
      "index": {
        "fields": ["foo", "bar"]
      },
      "name": "foo-bar-json-index",
      "type" : "json"
    }
  }]
};
