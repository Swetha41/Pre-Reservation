var res = {
  calstart : function () {
    res.cal("start");
  },

  calend : function () {
    res.cal("end");
  },

  cal : function (target) {
    // Disable submit first
    document.getElementById("res_go").disabled = true;

    var calchange = target=="start" ? res.calstart : res.calend ;
    var picker = target=="start" ? res.pickstart : res.pickend ;

    // AJAX data
    var data = new FormData();
    data.append('req', 'show-cal');

    var select = document.querySelector("#res_" + target +" select.month");
    if (select!=null) {
      data.append('month', select.value);
      select = document.querySelector("#res_" + target + " select.year");
      data.append('year', select.value);
    }

    // AJAX call
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "ajax-reserve.php", true);
    xhr.onload = function(){
      // Set contents, click, change actions
      document.getElementById("res_" + target).innerHTML = this.response;
      select = document.querySelector("#res_" + target + " select.month");
      select.addEventListener("change", calchange);
      select = document.querySelector("#res_" + target + " select.year");
      select.addEventListener("change", calchange);
      select = document.querySelectorAll("#res_" + target + " .pick, #res_" + target + " .active");
      for (var i of select) {
        i.addEventListener("click", picker);
      }

      // Enable submit
      document.getElementById("res_go").disabled = false;
    };
    xhr.send(data);
  },

  pickstart : function () {
    res.pick('start', this);
  },

  pickend : function () {
     res.pick('end', this);
  },

  pick : function (target, picked) {
   var select = document.querySelector("#res_" + target + " .active");
    if (select!=picked) {
      select.classList.remove("active");
      select.classList.add("pick");
      picked.classList.remove("pick");
      picked.classList.add("active");
    }
  },

  save : function () {

    var start = document.querySelector("#res_start td.active").innerHTML;
    if (start.length==1) { start = "0" + start; }
    start = document.querySelector("#res_start select.month").value + "-" + start;
    start = document.querySelector("#res_start select.year").value + "-" + start;

    var end = document.querySelector("#res_end td.active").innerHTML;
    if (end.length==1) { end = "0" + end; }
    end = document.querySelector("#res_end select.month").value + "-" + end;
    end = document.querySelector("#res_end select.year").value + "-" + end;

    if (Date.parse(start)>=Date.parse(end)) {
      alert("End date cannot be earlier than start date!");
    } else {
  
      var data = new FormData();
      data.append('req', 'book-range');
      data.append('name', document.getElementById("res_name").value);
      data.append('email', document.getElementById("res_email").value);
      data.append('tel', document.getElementById("res_tel").value);
      data.append('notes', document.getElementById("res_notes").value);
      data.append('start', start);
      data.append('end', end);

      // AJAX call
      var xhr = new XMLHttpRequest();
      xhr.open('POST', "ajax-reserve.php", true);
      xhr.onload = function(){
        var res = JSON.parse(this.response);
       if (res.status==1) {
          location.href = "thank-you.html";
        }
        else {
          alert(res.message);
        }
      };
      xhr.send(data);
    }
    return false;
  }
};

window.addEventListener("load", function(){
  res.calstart();
  res.calend();
});