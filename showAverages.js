
let assignments = []
let groups = []

let round = (a, decimals) => Math.round(a * Math.pow(10, Math.round(decimals))) / Math.pow(10, Math.round(decimals))
let fixedDecimals = (f, decimals) => {
    // Do nothing if a non-float was passed in
    if(isNaN(parseFloat(f))) return f
    if(decimals < 1) return Math.round(f)

    let stringF = f + ""

    if(!stringF.includes(".")) stringF += ".0"
    let decimalsInF = stringF.split(".")[1].length

    if(decimalsInF > decimals) stringF = round(f, decimals) + ""

    decimalsInF = stringF.split(".")[1].length
    for(let i = 0; i < decimals - decimalsInF; i++)
        stringF += "0"

    return stringF
}

// Get the id of each assignment
$(".student_assignment").each(function() {
    let a = {};
    a.id = parseInt(this.id.split("submission_")[1])
    if (isNaN(a.id)) return;
    assignments.push(a)
})

// Get information on each assignment
assignments.map(a => {
    a.name = $("#submission_" + a.id + " > th.title > a").text()
    a.group = $("#submission_" + a.id + " > th.title > div.context").text()
    a.totalPoints = parseFloat($("#submission_" + a.id + " > td.points_possible").text())
    a.pointsReceived = parseFloat($("#submission_" + a.id + " > td.assignment_score > div.score_holder > div > span.original_points").text())
    a.averagePoints = parseFloat($("#score_details_" + a.id + " > tbody > tr > td").eq(0).text().split("Mean:")[1])
    a.high = parseFloat($("#score_details_" + a.id + " > tbody > tr > td").eq(1).text().split("High:")[1])
    a.low = parseFloat($("#score_details_" + a.id + " > tbody > tr > td").eq(2).text().split("Low:")[1])

    return a;
})

// Filter out ungraded assignments
assignments = assignments.filter(a => !isNaN(a.averagePoints));

// Get information on each group
$("table.summary > tbody > tr").each(function() {
    let g = {};
    g.name = $(this).children("th").text().trim()
    if(g.name == "Total") return;
    g.weight = parseFloat($(this).children("td").text().split("%")[0])/100

    g.assignments = assignments.filter(a => a.group == g.name);
    g.totalPoints = g.assignments.reduce((pts, a) => pts + a.totalPoints, 0)
    g.totalPointsReceived = g.assignments.reduce((pts, a) => pts + a.pointsReceived, 0)
    g.totalAveragePoints = g.assignments.reduce((pts, a) => pts + a.averagePoints, 0)

    g.gradeReceived = g.totalPointsReceived / g.totalPoints;
    g.averageGrade = g.totalAveragePoints / g.totalPoints;

    groups.push(g);
})

// Calculate and add average grades for each group
$("tr.group_total").each(function() {
    let group = groups.filter((g) => g.name == $(this).children("th.title").text().trim())[0]
    if(isNaN(group.averageGrade)) return;

    let txt = "Average: " + fixedDecimals(group.averageGrade * 100, 2) + "% (" + fixedDecimals(group.totalAveragePoints, 2) + " / " + fixedDecimals(group.totalPoints, 2) + ")";
    $(this).children("td.due").text(txt)
    $(this).children("td.due").css("color", "purple")
    $(this).children("td.due").css("font-size", "0.7em")
    $(this).children("td.due").css("font-style", "italic")
})

// Calculate and add total average grade
groups = groups.filter(g => g.totalPoints > 0)
let totalAverageGrade = groups.reduce((t, g) => t + (g.averageGrade * g.weight), 0) / groups.reduce((t, g) => t + g.weight, 0)

$("tr.final_grade > td.due").text("Average: " + fixedDecimals(totalAverageGrade * 100, 2) + "%")
$("tr.final_grade > td.due").css("color", "purple")
$("tr.final_grade > td.due").css("font-size", "0.7em")
$("tr.final_grade > td.due").css("font-style", "italic")
