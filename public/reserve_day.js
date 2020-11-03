var res = {
  cal : function () {
    document.getElementById("res_go").disabled = true;

    var data = new FormData();
    data.append('req', 'show-cal');

    var select = document.querySelector("#res_date select.month");
    if (select!=null) {
      data.append('month', select.value);
      select = document.querySelector("#res_date select.year");
      data.append('year', select.value);
    }

    // AJAX call
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "ajax-reserve.php", true);
    xhr.onload = function(){
      document.getElementById("res_date").innerHTML = this.response;
      select = document.querySelector("#res_date select.month");
      select.addEventListener("change", res.cal);
      select = document.querySelector("#res_date select.year");
      select.addEventListener("change", res.cal);
      select = document.querySelectorAll("#res_date .pick, #res_date .active");
      for (var i of select) {
        i.addEventListener("click", res.pick);
      }

      document.getElementById("res_go").disabled = false;
    };
    xhr.send(data);
  },

  pick : function () {

    var select = document.querySelector("#res_date .active");
    if (select!=this) {
      select.classList.remove("active");
      select.classList.add("pick");
      this.classList.remove("pick");
      this.classList.add("active");
    }
  },

  save : function () {

    var select = document.querySelector("#res_date td.active").innerHTML;
    if (select.length==1) { select = "0" + select; }
    select = document.querySelector("#res_date select.month").value + "-" + select;
    select = document.querySelector("#res_date select.year").value + "-" + select;

    var data = new FormData();
    data.append('req', 'book-day');
    data.append('name', document.getElementById("res_name").value);
    data.append('email', document.getElementById("res_email").value);
    data.append('tel', document.getElementById("res_tel").value);
    data.append('notes', document.getElementById("res_notes").value);
    data.append('date', select);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', "ajax-reserve.php", true);
    xhr.onload = function(){
      var res = JSON.parse(this.response);
     
      if (res.status==1) {
        location.href = "thank-you.html";
      }
      // ERROR - show error
      else {
        alert(res.message);
      }
    };
    xhr.send(data);
    return false;
  }
};

window.addEventListener("load", res.cal);