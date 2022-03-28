import React, { useState } from 'react';
import "./Search.css";
const Search = () => {
    const [searchText, setSearchText] = useState("");
    const [gameData, setGameData] = useState("empty");

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
            <p style={{textAlign: "center", color: "white"}}>Please note this website is actively under development and not all Idleon data is present!</p>
            <div id="searchInput" style={{display: "flex"}}>
                <input 
                    name="text" 
                    type="text" 
                    placeholder="Search" 
                    onChange={(event) => {
                        let text = event.target.value;
                        if(!isRegex(text)){
                            //TODO handle inproper regex
                            return;
                        }
                        setSearchText(text)
                    }}
                />
                <p 
                class="hovertext" 
                data-hover="Accepts regular search or Regex. Ignores case"
                >?</p>
            </div>
            {/* <button>Search</button> */}
            <SearchResult searchText = {searchText} data={gameData}/>
            {/* <p>{JSON.stringify(gameData)}</p> */}
        </div>
    );
}

const SearchResult = ({ searchText, data }) => {
    let regex = null;
    let displayData = null;
    let regexParams = "i"; //i = ignore case
    if(!isValidRegex(searchText)){
        regex = new RegExp(regexEscape(searchText), regexParams);
    }else{
        regex = new RegExp(searchText, regexParams);
    }
    displayData = searchData(regex, data);
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

//Get Method
function getData(setJson){
    fetch("https://raw.githubusercontent.com/Corbeno/Idleon-Insight/main/output/output.json")
        .then((response) => response.json())
        .then((json) => {
            setJson(json);
    });
};


function isRegex(text){
    return true;
}
export default Search;