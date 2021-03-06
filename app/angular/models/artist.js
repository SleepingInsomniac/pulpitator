app.factory(
'Artist',
function($resource) {
  
  return $resource('/artists/:id', {id:'@id'}, {
    update: {
      method: 'PUT',
      transformRequest: function(data) {
        return angular.toJson({artist: data});
      }
    },
    create: {
      method: 'POST',
      transformRequest: function(data) {
        return angular.toJson({artist: data});
      }
    }
  });
  
});