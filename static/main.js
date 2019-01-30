$(document).ready(function() {
	renderUserInformation();

  $('#list-of-groups').on('click', '.list-group-item' ,function() {
    $(this).next().slideToggle();
  });

	$('#create-group').click(function() {
		let groupCode = $('#new-group-code').val();
		$.ajax({
			url: "/api/createGroup",
			data: { groupCode },
			type: 'POST',
			success: function (res) {
        $('#new-group-code').val("");
				if (res.groupCodeTaken)
          $('#create-group-err-message').val("Group Name Exists").show();
				else {
          let group = res.groups[res.groups.length-1];
          addNextGroup(group.groupCode, group.isAdmin, res.username);
        }
			}
		})
	})

  $('#join-group').click(function() {
    let groupCode = $('#existing-group-code').val();
    $.ajax({
      url: "/api/joinGroup", 
      data: { groupCode },
      type: 'POST', 
      success: function (res) {
        $('#new-group-code').val("");

        if (res.groupNonExistent)
          $('#join-group-err-message').text("Group does not exist").show();
        else if (res.groupAlreadyIn)
          $('#join-group-err-message').text("Already in group!").show();
        else {
          let group = res.groups[res.groups.length-1];
          addNextGroup(group.groupCode, group.isAdmin);
        }
      }
    })
  })

  $('#list-of-groups').on('click', '.create-assignments' ,function() {
    let groupCode = $(this).attr('id');
    let $div = $(this).parent();
    $.ajax({
      url: "/api/createAssignments",
      data: { groupCode },
      type: 'POST',
      success: function (res) {
        //who knows
        $div.empty();
        if (res.group.assignments.length == 0) 
          $div.append("<p> Not enough members in group </p>");
        else 
          updateGroup(res.group, res.user.username, $div);
      }
    })
  })
});
//on document ends here

function updateGroup(groupInfo, thisUser, $div) {
  var assigned = findMyAssignment(groupInfo.assignments, thisUser).fullName;
  var notif = $("<p> You are Secret Santa for " + assigned + "!</p>"); 
  $div.append(notif);
}

function renderGroups (res) {
  $('#list-of-groups').empty();
  var $listOfGroups = $('#list-of-groups');

  let groups = res.groups;
	for (let i = 0; i < groups.length; i++) {
    addNextGroup(groups[i].groupCode, groups[i].isAdmin, res.username);
	}
};

function addNextGroup (groupCode, isAdmin, thisUser) {
  var $listOfGroups = $('#list-of-groups');
  $.when(getUsersInGroup(groupCode))
    .then(function(groupInfo) {
      let $title = "<a class=\"list-group-item\" id=\"" + 
        groupCode + "\">" +  groupCode + "</a>";
      let $div = $("<div>", {class: "group-Content", id:  
            groupCode + "-info"}); 

      if (groupInfo.assignments.length == 0) { //secret santa's not made
        let members = "<p> Members: "
          for (let j = 1; j < groupInfo.usersByName.length; j++) {
            members += groupInfo.usersByName[j] + ", ";
          }
        members += "</p>";
        $div.append(members);
        if (isAdmin) {
          var button = " <button class=\"btn btn-primary create-assignments\" id=\"" 
            + groupCode + "\" > Assign Secret Santa's</button> </td></tr>";
          $div.append(button);
        }
      } else {
        var assigned = findMyAssignment(groupInfo.assignments, thisUser).fullName;
        var notif = $("<p> You are Secret Santa for " + assigned + "!</p>"); 
        $div.append(notif);
      } 
      $listOfGroups.append($title);
      $listOfGroups.append($div);
   });
}

function renderUserInformation() {
	$.ajax({
		url: "/api/userInfo", 
		data: {},
		type: 'GET',
		success: function (res) {
      if (res)
			 renderGroups(res);
		}
	})
}

function getUsersInGroup(groupCode) {
  return $.ajax({
    url: "/api/groupInfo", 
    data: { groupCode }, 
    type: 'POST'
  });
}

function findMyAssignment(arr, username) {
  let ans = 0;
  var i = 0;
  for (i = 0; i < arr.length; i++) {
    if (arr[i].username == username) {
      ans = (i+1) % arr.length;
      break;
    }
  }
  return arr[ans]; //returns JSON of username, fullName
}



