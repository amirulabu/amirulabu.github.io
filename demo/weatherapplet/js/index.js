$(document).ready(function() {
  var lon, lat,temp;
  $("#getC").hide();
  navigator.geolocation.getCurrentPosition(function(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    

    $.getJSON("https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=69742e804bc7433c39d74180fce6ed9a", function(json) {
      var html = "";
      
      temp = json.main.temp - 273.15;
      html += json.name + "<br>" + json.weather[0].main + "<br>";

      $("#data").html(html);
      $("#temp").html(temp +"&deg;C");
      $('#icon').html("<img src='https://openweathermap.org/img/w/"+ json.weather[0].icon +".png' height='100px'><br><br><br>")

    });
    
    
    
    $("#getF").on("click", function() {
      temp = Math.ceil(((temp*9/5)+32)*10)/10;
      $("#temp").html(temp +"&deg;F");
      $("#getF").hide();
      $("#getC").show();
    });
    
    $("#getC").on("click", function() {
      temp = Math.ceil(((temp-32)*(5/9))*10/10);
      $("#temp").html(temp +"&deg;C");
      $("#getC").hide();
      $("#getF").show();
    });

  });

});