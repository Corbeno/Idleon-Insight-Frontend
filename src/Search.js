import React, { useState, useEffect } from 'react';
import "./Search.css";
import customSearches from './customSearches.json';

const Search = () => {
    const queryParams = new URLSearchParams(window.location.search)
    const search = queryParams.get("search");
    const [searchText, setSearchText] = useState(search || "");
    const [gameData, setGameData] = useState("empty");
    const debounceSearchText = debounce((text) => setSearchText(text));
    
    useEffect(() => {
        getData(setGameData);
    }, []);

    useEffect(() => {
        const el = document.getElementById("inputBox");
        if(el){
            el.value = search || "";
        }
    });

    function setSearch(text){
        window.history.pushState( {} , '', '?search=' + encodeURIComponent(text));
        debounceSearchText(text);
    }

    if(gameData === "empty"){
        //TODO return error?
        return null;
    }

    return (
        <div id="searchPage">
            <h1 style={{textAlign: "center"}}>Idleon Insight <a style={{paddingLeft:10}} href="https://github.com/Corbeno/Idleon-Insight-Frontend" target="_blank"><img src="./github-logo.png" width="30" height="30" /></a></h1>
            <select id="customSearchSelector" onChange={(e) => {setSearch(e.target.value)}}>
                <option value="none" selected disabled hidden>Custom Search</option>
                {customSearches.map((each, i) => {
                    return (<option key={"customSearch" + i} value={each.search}>{each.name}</option>)
                })}
            </select>
            <p style={{textAlign: "center", color: "white"}}>See missing data? <a href="https://github.com/Corbeno/Idleon-Insight-Frontend/issues" target="_blank">Report it!</a></p>
            <div id="searchInput" style={{display: "flex", paddingBottom:0}}>
                <input 
                    id="inputBox"
                    name="text" 
                    type="text" 
                    placeholder="Search"
                    onChange={(event) => {
                        document.getElementById("customSearchSelector").value = "none";
                        setSearch(event.target.value)
                    }}
                />
                <p 
                className="hovertext" 
                data-hover="Accepts regular search or Regex. Ignores case"
                >?</p>
            </div>
            <p style={{textAlign: "center", color: "white", marginTop:0}}>Searches exclusively through the Bonus column</p>
            <SearchResult searchText = {searchText} data={gameData}/>
        </div>
    );
}

const SearchResult = ({ searchText, data }) => {
    let regex = null;
    let displayData = null;
    let regexParams = "i"; //i = ignore case, don't use global tag here it breaks stuff...
    //order displayed at bottom coorelates to the order in list
    let searchPushToBottom = ["Obol", "Armor", "Tool", "Weapon", "Upgrade Stone", "Gem Shop"];
    let singleVeryBottom = "Gem Shop";
    if(!isValidRegex(searchText)){
        regex = new RegExp(regexEscape(searchText), regexParams);
    }else{
        regex = new RegExp(searchText, regexParams);
    }
    displayData = searchData(regex, data);
    displayData = displayData.sort(function(a, b){
        if(a.source === singleVeryBottom){
            return 1;
        }else if(b.source === singleVeryBottom){
            return -1;
        }
        let aa = searchPushToBottom.includes(a.source);
        let bb = searchPushToBottom.includes(b.source)
        if(!aa && !bb){
            return ('' + a.source).localeCompare(b.source);
        }else if(aa && !bb){
            return 1;
        }else if(!aa && bb){
            return -1;
        }else{ //aa && bb
            return searchPushToBottom.indexOf(a.source) - searchPushToBottom.indexOf(b.source);
            // return ('' + a.source).localeCompare(b.source);
        }

    })
    return (
        <div>
            <div id="resultCount">{displayData.length} Results</div>
            <table id="table">
                <thead>
                    <tr id="tr-header">
                        <th>Source</th>
                        <th>Name</th>
                        <th>Bonus</th>
                    </tr>
                </thead>
                <tbody>
                    {displayData.map(function(each, i){
                        return(
                            <tr key={each.source + each.name + i}>
                                <th className="sourceColumn">{each.source || ""}</th>
                                <th className="nameColumn">{each.name}</th>
                                <th className="bonusColumn">{each.bonuses.map(function(eachBonus, i, arr){
                                    return(" " + eachBonus + ((i === arr.length-1) ? " ": ","));
                                })}
                                </th>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function searchData(search, data){
    let r = [];
    for(let obj of data){
        for(let bonus of obj.bonuses){
            if(search.test(bonus) === true){
                r.push(obj);
                break;
            }
        }
    }
    return r;
}

function isValidRegex(str){
    try{
        new RegExp(str);
    }catch(e){
        return false;
    }
    return true;
}

function regexEscape(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function getData(setJson){
    fetch("https://raw.githubusercontent.com/Corbeno/Idleon-Insight/main/output/output.json")
        .then((response) => response.json())
        .then((json) => {
            setJson(json);
    });
};

export default Search;