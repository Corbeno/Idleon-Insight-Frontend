import React, { useState } from 'react';
import {useLocation} from "react-router-dom";
import "./Search.css";
const Search = () => {
    const [searchText, setSearchText] = useState("");
    const [gameData, setGameData] = useState("empty");
    const debounceSearchText = debounce((text) => setSearchText(text));
    const queryParams = new URLSearchParams(window.location.search)
    const search = queryParams.get("search");
    React.useEffect(() => {
        // console.log('MyComponent onMount');
        getData(setGameData);
        return () => {
            // console.log('MyComponent onUnmount');
        };
    }, []);

    if(gameData === "empty"){
        //TODO return error?
        return null;
    }

    return (
        <div id="searchPage">
            <h1 style={{textAlign: "center"}}>Idleon Insight</h1>
            <p style={{textAlign: "center", color: "white"}}>See missing data? Report it!</p>
            <div id="searchInput" style={{display: "flex", paddingBottom:0}}>
                <input 
                    name="text" 
                    type="text" 
                    placeholder="Search"
                    onChange={(event) => {
                        let text = event.target.value;
                        debounceSearchText(text);
                    }}
                />
                <p 
                class="hovertext" 
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
    let regexParams = "i"; //i = ignore case
    let searchPushToBottom = ["Armor", "Tool", "Weapon", "Upgrade Stone"];
    if(!isValidRegex(searchText)){
        regex = new RegExp(regexEscape(searchText), regexParams);
    }else{
        regex = new RegExp(searchText, regexParams);
    }
    displayData = searchData(regex, data);
    displayData = displayData.sort(function(a, b){
        let aa = searchPushToBottom.includes(a.source);
        let bb = searchPushToBottom.includes(b.source)
        if(!aa && !bb){
            return ('' + a.source).localeCompare(b.source);
        }else if(aa && !bb){
            return 1;
        }else if(!aa && bb){
            return -1;
        }else{
            return ('' + a.source).localeCompare(b.source);
        }

    })
    return (
        <table id="table">
            <tr id="tr-header">
                <th>Source</th>
                <th>Name</th>
                <th>Bonus</th>
            </tr>
            {displayData.map(function(each){
                return(
                    <tr>
                        <th class="sourceColumn">{each.source || ""}</th>
                        <th class="nameColumn">{each.name}</th>
                        <th class="bonusColumn">{each.bonuses.map(function(eachBonus, i, arr){
                            return(" " + eachBonus + ((i === arr.length-1) ? " ": ","));
                        })}
                        </th>
                    </tr>
                )
            })}
        </table>
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
            if(search.test(bonus)){
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