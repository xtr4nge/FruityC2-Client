/*
# Copyright (C) 2017 xtr4nge [_AT_] gmail.com
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// -------------------
// GLOBAL VARS
// -------------------

// SERVER
FruityC2 = ""
TOKEN="32F04C2998A8A3F9EA12FA79254349BD8F5CC327"

// -> LOGIN
login_host = "";
login_port = "";
login_user = "";

// -> AUTOCOMPLETE CONSOLE
availableTags = [];
/*
var availableTags = [
  "shell",
  "powershell",
  "pwd",
  "cd",
  "checkin",
  "hashdump",
  "mimikatz",
  "check_services",
  "upload",
  "download",
  "ls",
  "dir",
  "screenshot",
  "steal_token",
  "revtoself",
  "spn_search",
  "spn_request",
  "kerberos_ticket_dump",
  "kerberos_ticket_purge"
];
*/

/*
availableTags = [];
availableTags.push("shell");
availableTags.push("powershell");
availableTags.push("pwd");
availableTags.push("cd");
availableTags.push("checkin");
availableTags.push("hashdump");
availableTags.push("mimikatz");
availableTags.push("check_services");
availableTags.push("upload");
availableTags.push("download");
availableTags.push("ls");
availableTags.push("dir");
availableTags.push("screenshot");
availableTags.push("spn_search");
availableTags.push("spn_request");
availableTags.push("spn_dump");
availableTags.push("kerberos_ticket_dump");
*/

// -> TARGET
view_mode = "list";
latest_tid = 0;
current_tid = 0;
current_tid_log = 0;

// -> CHAT
latest_cid = 0;
username = "";

// -> ALERT
latest_aid = 0;

// -------------------
// FUNCTIONS
// -------------------

function check_login() {
	login_host = localStorage.getItem('login_host');
	login_port = localStorage.getItem('login_port');
	login_user = localStorage.getItem('login_user');
	
	$("#login_host").val(login_host);
	$("#login_port").val(login_port);
	$("#login_user").val(login_user);
	
	if ((login_host == "" || !login_host) || (login_port == "" || !login_port)) {
		$('#mLogin').modal('show');
	} else if ((login_user == "" || !login_user)) {
		$('#connection_error').html("Error: Username");
		$('#connection_error').show();
		$('#mLogin').modal('show');
	} else {
		username = login_user;
		/*
		$("#login_host").val(login_host);
		$("#login_port").val(login_port);
		$("#login_user").val(login_user);
		*/
		$("#chat-user").val(username);
		FruityC2 = "http://"+login_host+":"+login_port;
		server_connectivity_check();
	}
}

function set_login() {
	
	username = $("#login_user").val();
	
	login_host = $("#login_host").val();
	login_port = $("#login_port").val();
	login_user = $("#login_user").val();
	
	FruityC2 = "http://"+login_host+":"+login_port;
	
	localStorage.setItem('login_host',login_host);
	localStorage.setItem('login_port',login_port);
	localStorage.setItem('login_user',login_user);
	/*
	$("#login_host").val(login_host);
	$("#login_port").val(login_port);
	$("#login_user").val(login_user);
	$("#chat-user").val(login_user);
	*/
	modal_close("mLogin");
	location.reload();
}

function logout() {
	localStorage.setItem('login_user','');
	username = "";
	//login_host = "";
	//login_port = "";
	login_user = "";
	
	$("#login_user").val(login_user);
	$("#chat-user").val(username);
	
}

function server_connectivity_check() {
	$.ajax({url: FruityC2+'/profiles',
        type: "HEAD",
        timeout:1000,
        statusCode: {
            200: function (response) {
                //alert('Working!');
            },
            400: function (response) {
                //alert('Not working!');
				$('#connection_error').html("Error: Host or Port");
				$('#connection_error').show();
				$('#mLogin').modal('show');
            },
			404: function (response) {
                //alert('Not working!');
				$('#connection_error').html("Error: Source IP not allowed");
				$('#connection_error').show();
				$('#mLogin').modal('show');
            },
            0: function (response) {
                //alert('Not working!');
				$('#connection_error').html("Error: Host or Port");
				$('#connection_error').show();
				$('#mLogin').modal('show');
            }              
        }
 });
}

$("#logs").change(function() {
	$('#logs').scrollTop($('#logs')[0].scrollHeight);
});

function modal_close(id) {
    $('#'+id).modal('toggle');
}

function unixtimeConverter(timestamp) {
	var date = new Date(timestamp*1000);
	var year = date.getFullYear();
	var month = ("0"+(date.getMonth()+1)).substr(-2);
	var day = ("0"+date.getDate()).substr(-2);
	var hour = ("0"+date.getHours()).substr(-2);
	var minutes = ("0"+date.getMinutes()).substr(-2);
	var seconds = ("0"+date.getSeconds()).substr(-2);

	return year+"-"+month+"-"+day+" "+hour+":"+minutes+":"+seconds;
}

function load_commands() {
	$.getJSON(FruityC2+"/commands", function(obj) {
		$.each(obj, function(key, value) {
			availableTags.push(key);
			$("#command_list").append("<div class='command-info'><a href='#'' onclick='set_command_info(\""+key+"\")'>"+key+"</a></div>" + value + "<br>");
		});
	});
}

// -------------------
// LOAD FUNCTIONS
// -------------------
$('#connection_error').hide();
check_login();

if (FruityC2 !== "") {
	load_profiles();
	load_payload();
	load_web_delivery();
	load_listener();
	load_chat(latest_cid);
	load_view_mode();
	load_alert(latest_aid);
	load_payload_file();
	load_commands();

	setInterval(function(){
		if ($('#mChat').is(':visible')){
			load_chat_msg(latest_cid);
			$("#alert-chat").html(0);
		} else {
			count_chat_msg(latest_cid);
		}
	}, 5000);
	
	setInterval(function(){
		count_target();
		load_view_mode();
		check_target_log(current_tid);
	}, 5000);
	
	setInterval(function(){
		if ($('#mAlert').is(':visible')){
			load_alert_id(latest_aid);
			$("#alert-alert").html(0);
		} else {
			count_alert(latest_aid);
		}
	}, 5000);
}
