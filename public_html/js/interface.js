function countrytableFrompersons(persons){
    const table = [];
    for (const person of persons) {
        const row = {
            Name: personToTd(person),
            Gender: person.gender,
            Country: person.country,
            Team: person.team,
            Club: person.club
        }
        table.push(row);
    }
    return table;
}

const simplePersontCols = ["firstname", "lastname", "gender", "country", "team", "club"];

function trFromPerson(person){
    const tr = {};
    for (const col of simplePersontCols) {
        if(person[col] != undefined){
            tr[col] = person[col];
        } else{
            tr[col] = "";
        }
    }
    return tr;
}

function resultsTotable(results){
    const table = [];
    for (const result of results) {
        table.push(trFromResult(result));
    }
    return table;
}


const simpleResultCols = ["place", "category", "gender", "remark", "trackStreet", "distance"];

function trFromResult(result){
    const tr = {};
    for (const col of simpleResultCols) {
        if(result[col] == undefined){
            tr[col] = "";
        } else{
            tr[col] = result[col];
        }
    }
    tr["Athlete"] = personToTd(result["person1"]);
    if(result["person2"] != null){
        tr["Athlete2"] = personToTd(result["person2"]);
    }
    if(result["person3"] != null){
        tr["Athlete3"] = personToTd(result["person3"]);
    }
    return tr;
}

function personToTd(person){
    const elem = $(`<a href="/athlete?id=${person.id}" class="result__person"><span>${person.firstname + "  " + person.lastname}</span></a`);
    const coutryCode = countryNameToCode(person.country);
    if(coutryCode != undefined){
        elem.append($(`<a href="/country?id=${person.country}" class="img-wrapper"><img class="result__country-flag" src="https://www.countryflags.io/${coutryCode}/shiny/32.png"></a>`));
        new Tooltip(elem.find(".img-wrapper"), person.country);
    }
    return elem;
}

function sortAthletes(athletes){
    athletes.sort((a, b) => {
        if(a.score > b.score) return -1;
        if(b.score > a.score) return 1;
        return 0;
    });
    return athletes;
}

function athleteDataToProfileData(athlete){
    console.log(athlete);
    let trophy1 = {
        data: getMedal("silver", athlete.silver),
        type: ElemParser.DOM,
        validate: () => athlete.silver > 0
    }
    let trophy2 = {
        data: getMedal("gold", athlete.gold),
        type: ElemParser.DOM,
        validate: () => athlete.gold > 0
    }
    let trophy3 = {
        data: getMedal("bronze", athlete.bronze),
        type: ElemParser.DOM,
        validate: () => athlete.bronze > 0
    }

    let amount = 0;
    let color;
    if(athlete.bronze > 0){
        amount++; color = "bronze";
    }
    if(athlete.silver > 0){
        amount++; color = "silver";
    }
    if(athlete.gold > 0){
        amount++; color = "gold";
    }
    if(amount === 1){
        let tmp = trophy2;
        switch(color){
            case "silver": trophy2 = trophy1; trophy1 = tmp; break;
            case "bronze": trophy2 = trophy3; trophy3 = tmp; break;
        }
    }
    return {
        name: athlete.firstname + " " +athlete.lastname,
        image: athlete.image != null ? "/img/uploads/" + athlete.image : null,
        left: {data: athlete.country, type: "countryFlag", link: `/country?id=${athlete.country}`},
        right: {data: athlete.gender, type: "gender"},
        trophy1, trophy2, trophy3,
        special: Math.round(athlete.score),
        primary: {
            // scoreShort: {
            //     description: "score short",
            //     data: Math.round(athlete.scoreShort)
            // },
            // scoreLong: {
            //     description: "score long",
            //     data: Math.round(athlete.scoreLong)
            // },
            sprinter: {
                data: (athlete.scoreLong / (athlete.scoreLong + athlete.scoreShort)),
                description: "Best discipline",
                description1: "Sprint",
                description2: "Long",
                type: "slider"
            },
            topTen: {
                data: athlete.topTen,
                description: "WM top 10 places:",
                validate: () => athlete.topTen > 0
            },
            birthYear: {
                data: athlete.birthYear,
                icon: "far fa-calendar",
                validate: (data) => {return data !== null && data > 1800}
            },
            bestDistance: {
                data: athlete.bestDistance,
                description: "Best discipline",
            },
            rank: {
                data: athlete.rank,
                description: "Rank",
            },
            rankShort: {
                data: athlete.rankShort,
                description: "Rank Short",
            },
            rankLong: {
                data: athlete.rankLong,
                description: "Rank long",
            },
            club: {data: athlete.club, description: "Club:"},
            team: {data: athlete.team, description: "Team:"}
        },
        secondary: profileInit,
        secondaryData: athlete
    };
    
        /**
     * ToDo:
     * -best Times
     * -competitions
     *      -races(place, time etc)
     * similar athletes after score and sprit / long distance (only for highly scored athletes)
     * -carrear(future)
     * contact
     * follow(also card mode)
     * 
     * 
     */
    function profileInit(wrapper, athlete){
        /**
         * Career
         */
        const careerElem = $(`<div><h2 class="section__header">Career</h2><div class="loading"></div></div>`);
        wrapper.append(careerElem);
        get("athleteCareer", athlete.idAthlete).receive((succsess, career) => {
            careerElem.find(".loading").remove();
            if(succsess && career.length !== 0){
                careerGraphAt(careerElem, career);
            } else{
                careerElem.append(`<p class="margin left double">${athlete.fullname} didnt competed in wolrd championships yet</p>`);
            }
        });

        /**
         * best times
         */
        const bestTimesElem = $(`<div><h2 class="section__header">Personal best times</h2><div class="loading circle"></div></div>`);
        get("athleteBestTimes", athlete.idAthlete).receive((succsess, times) => {
            bestTimesElem.find(".loading").remove();
            if(succsess && times.length !== 0){
                bestTimesAt(bestTimesElem, times)
            } else{
                bestTimesElem.append(`<p class="margin left double">There are no records for ${athlete.fullname} in the database yet :(</p>`)
            }
        });
        wrapper.append(bestTimesElem);
        /**
         * competitions
         */
        const compElem = $(`<div><h2 class="section__header">Competitions</h2><div class="loading circle"></div></div>`);
        wrapper.append(compElem);
        get("athleteCompetitions", athlete.idAthlete).receive((succsess, competitions) => {
            compElem.find(".loading").remove();
            if(succsess && competitions.length !== 0){
                compElem.append(getCompetitionListElem(competitions));
            } else{
                compElem.append(`<p class="margin left double">${athlete.fullname} didn't compete in any of our listed races yet :(</p>`)
            }
        });
    };
}

function bestTimesAt(elem, bestTimes){
    console.log(bestTimes);
    const wrapper = $(`<div class="best-times flex"></div>`);
    const shortElem = $(`<div class="sprint"><h2>Short</h2></div>`);
    const longElem = $(`<div class="long"><h2>Long</h2></div>`);
    let short = false;
    let long = false;
    for (const time of bestTimes) {
        const timeElem = $(`<div class="time flex justify-space-between"/>`);
        timeElem.append(`<a href="/race/index.php?id=${time.idRace}"><div>${time.distance}</div><div>${time.bestTime}</div><div>${time.athleteName !== undefined ? time.athleteName : ""}</div></a>`);
        if(time.isSprint == 1){
            shortElem.append(timeElem);
            short = true;
        } else{
            longElem.append(timeElem);
            long = true;
        }
    }
    if(short){
        wrapper.append(shortElem)
    }
    if(long){
        wrapper.append(longElem)
    }
    elem.append(wrapper);
    console.log(wrapper.height())
}


function athleteToProfile(athlete, minLod = Profile.MIN){
    const profile = new Profile(athleteDataToProfileData(athlete), minLod);
    if("score" in athlete === false || "scoreLong" in athlete === false || "scoreShort" in athlete === false || "gold" in athlete === false || "silver" in athlete === false || "bronze" in athlete === false){//athlete not complete needs ajax
        console.log("loading incomplete profile")
        get("athlete", athlete.id).receive((succsess, newAthlete) => {
            if(succsess){
                profile.updateData(athleteDataToProfileData(newAthlete));
            } else{
                console.log("failed loading profile")
            }
        });
    }
    return profile;
}

function pathFromRace(r){
    return $(`
    <div class="path">
        <a href="/year?id=${r.raceYear}" class="elem">${r.raceYear}<span class="delimiter"> > </span></a>
        <a href="/competition?id=${r.idCompetition}" class="elem"> ${r.location}<span class="delimiter"> > </span></a>
        <a href="/competition?id=${r.idCompetition}&trackStreet=${r.trackStreet}" class="elem">${r.trackStreet}<span class="delimiter"> > </span></a>
        <div class="elem">${r.category}<span class="delimiter"> > </span></div>
        <div class="elem">${r.gender}<span class="delimiter"> > </span></div>
        <div class="elem">${r.distance}</div>
    </div>`);
}

function linksFromLinkString(string){
    if(string === undefined){
        return [];
    }
    if(string === null){
        return [];
    }
    if(string.length === 0){
        return [];
    }
    let links = string.split("https://www.youtube.com/watch?v=");
    for (let i = 0; i < links.length; i++) {
        links[i] = links[i].replace(";", "");
    }
    links.splice(0,1);
    return links;
}

function getYtVideo(link){
    const ids = linksFromLinkString(link);
    if(ids.length === 0){
        return $();
    }
    let text = "videos";
    if(ids.length === 1){
        text = "video";
    }
    const head = $(`<div class="youtube-head"><i class="fab fa-youtube"></i><div class="margin left">${ids.length} ${text}</div></div>`);
    const body = $(`<div class="youtube-body"></div>`);
    for (const id of ids) {
        body.append(
            `<iframe style="width: 100%;"src="https://www.youtube.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        );
    }
    const ac = new Accordion(head, body)
    return ac.element;
}
// <iframe width="949" height="534" src="https://www.youtube.com/embed/YcXbt0iVu0A" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

function getRaceTable(parent, race){
    console.log(race)
    const elem = $(`<div class="race"></div>`);
    const raceTable = $(`<div class="race-table">`);
    elem.append(pathFromRace(race));
    elem.append(getYtVideo(race.link));
    elem.append(raceTable);
    for (const result of race.results) {
        result.athletes = profilesElemFromResult(result);
        result.place = {
            data: result.place,
            alignment: "center",
            type: "place"
        };
        if(result.time !== null){
            // result.time = result.time.substring(3, 100)
        }
    }
    
    const table = new Table(raceTable, race.results);
    table.setup({
        layout: {
            place: {allowSort: false},
            time: {
                displayName: "Time",
                allowSort: true,
                use: race.results[0].time !== null
            },
            athletes: {
                displayName: "Athlete/s",
                allowSort: false
            },
        }
    });
    table.init();
    parent.append(elem);
    return table;
}

function profilesElemFromResult(result){
    const elem = {
        data: [],
        type: "list",
        direction: "column"
    }
    if("athletes" in result){
        for (const athlete of result.athletes) {
            elem.data.push({
                data: athleteToProfile(athlete, Profile.MIN),
                type: "profile"
            });
        }
        
    }
    return elem;
}

/**
 * Country
 */
function countryToProfile(country, minLod = Profile.MIN){
    const profile = new Profile(countryToProfileData(country), minLod);
    if("score" in country === false || "scoreLong" in country === false || "scoreShort" in country === false || "gold" in country === false || "silver" in country === false || "bronze" in country === false){//athlete not complete needs ajax
        console.log("loading incomplete profile")
        get("country", country.country).receive((succsess, newCountry) => {
            if(succsess){
                profile.updateData(athleteDataToProfileData(newCountry));
            } else{
                console.log("failed loading country " + country.country);
            }
        });
    }
    profile.colorScheme = 1;
    return profile;
}

function countryToProfileData(country){
    let trophy1 = {
        data: getMedal("silver", country.silver),
        type: ElemParser.DOM,
        validate: () => country.silver > 0
    }
    let trophy2 = {
        data: getMedal("gold", country.gold),
        type: ElemParser.DOM,
        validate: () => country.gold > 0
    }
    let trophy3 = {
        data: getMedal("bronze", country.bronze),
        type: ElemParser.DOM,
        validate: () => country.bronze > 0
    }

    let amount = 0;
    let color;
    if(country.bronze > 0){
        amount++; color = "bronze";
    }
    if(country.silver > 0){
        amount++; color = "silver";
    }
    if(country.gold > 0){
        amount++; color = "gold";
    }
    if(amount === 1){
        let tmp = trophy2;
        switch(color){
            case "silver": trophy2 = trophy1; trophy1 = tmp; break;
            case "bronze": trophy2 = trophy3; trophy3 = tmp; break;
        }
    }
    return {
        name: country.country,
        image: {data: country.country, type: "countryFlag", link: `/country?id=${country.country}`, size: 64, class: "countryBig"},
        // right: country.country,
        trophy1, trophy2, trophy3,
        special: Math.round(country.score),
        primary: {
            scoreShort: {
                description: "score short",
                data: Math.round(country.scoreShort)
            },
            scoreLong: {
                description: "score long",
                data: Math.round(country.scoreLong)
            },
            sprinter: {
                data: (country.scoreLong / (country.scoreLong + country.scoreShort)),
                description: "Best discipline",
                description1: "Sprint",
                description2: "Long",
                type: "slider"
            },
            topTen: {
                data: country.topTen,
                description: "WM top 10 places:",
                validate: () => country.topTen > 0
            },
        },
        secondary: profileInit,
        secondaryData: country
    };
    
        /**
     * ToDo:
     * -best Times
     * -competitions
     *      -races(place, time etc)
     * similar countrys after score and sprit / long distance (only for highly scored countrys)
     * -carrear(future)
     * contact
     * follow(also card mode)
     * 
     * 
     */
    function profileInit(wrapper, country){
        /**
         * Athletes
         */
        const athletesElem = $(`<div><h2 class="section__header">Top ${Math.min(country.members, 10)} athletes</h2><div class="loading circle"></div></div>`)
        wrapper.append(athletesElem);
        get("countryAthletes", country.country).receive((succsess, athletes) => {
            const profiles = [];
            let i = 0;
            max = 10;
            for (const athlete of athletes) {
                if(i == max){
                    break;
                }
                profiles.push(athleteToProfile(athlete, Profile.CARD));
                i++;
            }
            athletesElem.find(".loading").remove();
            if(succsess){
                const slideShow = $(`<div/>`);
                profileSlideShowIn(slideShow, profiles);
                athletesElem.append(slideShow);
            }
        });

        /**
         * Career
         */
        const careerElem = $(`<div><h2 class="section__header">Career</h2><div class="loading"></div></div>`);
        wrapper.append(careerElem);
        get("countryCareer", country.country).receive((succsess, career) => {
            careerElem.find(".loading").remove();
            if(succsess && career.length !== 0){
                careerGraphAt(careerElem, career);
            } else{
                careerElem.append(`<p class="margin left double">${athlete.fullname} didnt competed in wolrd championships yet</p>`);
            }
        });

         /**
         * best times
         */
        const bestTimesElem = $(`<div><h2 class="section__header">Countrywide best times</h2><div class="loading circle"></div></div>`);
        get("countryBestTimes", country.country).receive((succsess, times) => {
            bestTimesElem.find(".loading").remove();
            if(succsess){
                bestTimesAt(bestTimesElem, times)
            }
        });
        wrapper.append(bestTimesElem);
        /**
         * competitions
         */
        const compElem = $(`<div><h2 class="section__header">Competitions</h2><div class="loading circle"></div></div>`);
        wrapper.append(compElem);
        get("countryCompetitions", country.country).receive((succsess, competitions) => {
            compElem.find(".loading").remove();
            if(succsess){
                compElem.append(getCompetitionListElem(competitions));
            }
        });
    };
}

function getCompetitionListElem(competitions){
    const elem = $(`<div class="competition-list"/>`);
    for (const comp of competitions) {
        const compElem = $(`<div class="competition"></div>`);
        for (const race of comp.races) {
            const head = $(`<div class="race flex align-center justify-space-between padding right"><span>${race.distance} ${race.category} ${race.gender}</span></div>`)
            const links = linksFromLinkString(race.link).length;
            if(links > 0){
                for (let i = 0; i < links; i++) {
                    head.find("span").append(`<i class="fab fa-youtube margin left"></i>`);
                }
            }
            if(race.sportlers !== undefined){
                head.append(`<div class="margin left double">${race.sportlers} sportlers, best place: ${race.bestPlace} </div>`);
            }
            if(race.place !== undefined){
                head.append(getPlaceElem(race.place));
            }
            
            const acRace = new Accordion(head, $("<div class='loading circle'></div>"),
                {
                    onextend: (head, body1, status) => {
                        body1.addClass("race--max");
                        if(!status.fetched){
                            get("race", race.idRace).receive((succsess, race) => {
                                body1.find(".loading").remove();
                                if(!succsess){
                                    return;
                                }
                                getRaceTable(body1, race);
                            });
                            status.fetched = true;
                        }
                }}, {
                    status: {
                        fetched: false
                    }
                }
            );
            compElem.append(acRace.element);
        }
        const head = $(`<div class="flex justify-start align-center"><div>${comp.type} ${comp.location} ${comp.raceYear}</div></div>`);
        if(comp.bronzeMedals !== undefined){
            if(comp.bronzeMedals > 0){
                head.append(getMedal("bronze", comp.bronzeMedals));
            }
            if(comp.silverMedals > 0){
                head.append(getMedal("silver", comp.silverMedals));
            }
            if(comp.goldMedals > 0){
                head.append(getMedal("gold", comp.goldMedals));
            }
        }
        const acComp = new Accordion(head, compElem);
        elem.append(acComp.element);
    }
    return elem;
}

function careerGraphAt(parent, career){
    let height = 400;
    let padding = 20;
    if(isMobile()){
        height = 1000;
        padding = 0;
    }
    career = preprocessCareer(career);
    console.log(career);
    const elem = $(`<div class="career"></div>`);
    const canvas = $(`<canvas class="career__canvas" width="1000px" height="${height}"/>`);
    elem.append(canvas);
    const ctx = canvas.get()[0].getContext('2d');

    /**
     * processing data
     */
    const labels = [];
    for (const year of career) {
        labels.push(year.raceYear);
    }
    const dataArrays = [];
    const usedFields = ["score", "scoreLong", "scoreShort"];
    for (const field of usedFields) {
        const dataArray = [];
        for (const year of career) {
            if(year.hasOwnProperty(field)){
                dataArray.push(Math.round(year[field] * 100) / 100);
            } else{
                dataArray.push(0);
            }
        }
        dataArrays.push(dataArray);
    }
    Chart.defaults.global.defaultFontColor = 'white';
    Chart.defaults.global.defaultFontSize = 16;
    new Chart(ctx,
        {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'sprint score',
                    data: dataArrays[2],
                    backgroundColor: "#26f86588",
                    borderColor: "#00aa33",
                    borderWidth: 1
                }, {
                    label: 'long distance score',
                    data: dataArrays[1],
                    backgroundColor: "#22AEAC",
                    borderColor: "#166aa1",
                    borderWidth: 1
                }, {
                    label: 'Overall score',
                    data: dataArrays[0],
                    backgroundColor: "#FA48EA",
                    borderColor: "#8A286A",
                    borderWidth: 1
                }]
            },
            options: {
                defaultFontColor: "#FFF",
                layout: {
                    padding: {
                        left: padding,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                },
                scales: {
                    yAxes: [{
                        color: "#FFF"
                    }]
                }
            }
        });
    parent.append(elem);
}

function preprocessCareer(career){
    if(career.length === 0){
        return career;
    }
    let last = career[0].raceYear;
    const parsed = [];
    for (const year of career) {
        year.raceYear = parseInt(year.raceYear);
        year.races = parseInt(year.races);
        while(last + 1 < year.raceYear){
            parsed.push({
                raceYear: last + 1,
                score: 0,
                scoreLong: 0,
                scoreShort: 0,
                races: 0
            });
            last++;
        }
        last = year.raceYear;
        parsed.push(year);
    }
    if(parsed.length === 1){
        parsed.push(parsed[0]);
    }
    return parsed;
}