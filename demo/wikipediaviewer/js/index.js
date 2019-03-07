$(document).ready(function() {
  
  $("#loadingDiv").hide();
  $("#buttonSearch").click(function(e) {
    $("#result").hide();
    $("#loadingDiv").show();
    
    var query = document.getElementById("textSearch").value;
    $.getJSON("https://en.wikipedia.org/w/api.php?action=query&format=json&prop=links&list=search&origin=*&srsearch=" + query, function(data) {
      var html = "";
      data.query.search.forEach(function(search) {
        html += "<div class='well well-sm'><h3><a href='https://en.wikipedia.org/wiki/" + encodeURIComponent(search.title) + "' >" + search.title + "</a></h3><p>" + search.snippet + "</p></div>";
      });
      $("#loadingDiv").hide();
      $("#result").show();
      console.log(html);
      $("#result").html(html);
    });
    
    e.preventDefault();
  });
});