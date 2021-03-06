import imdbAPI from "../../utils/imdbAPI";
import React from "react";
import { Link } from "react-router-dom";
import InputBox from "../../components/InputBox";
import Movie from "../../components/Movie";
import Movies from "../../components/Movies";

class ResourcesPage extends React.Component {
    state = {
        sq: "",//search query entered by user
        results: [],//array of results returned from api
        // previousSearch: {},//previous search term saved after search completed
        // noResults: false,//boolean used as flag for conditional rendering
    };

    handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

    handleClick = async (e) => {
        e.preventDefault()

        console.log(this.state.sq);

        imdbAPI.searchMovie(this.state.sq).then(res => {
            console.log("RES", res);

            this.setState({
                info: res.results
            }, () => console.log(this.state));
        });
    }

    render () {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                    
                        <div className="card">
                        <div className="card-body">
                        <span className="card-title"><h3>Search Movie</h3></span>
                        
                        <form className="container">
                            <InputBox type="text" name="sq" label="Search" value={this.state.sq} onChange={this.handleChange}/>
                            <button type="submit" className="btn btn-primary" onClick={this.handleClick}>Submit</button>
                        </form>

                        </div> 
                        </div>

                    </div>
                </div>
                <Movies>
                    <Movie />
                </Movies>
            </div>
        );
    }
}

export default ResourcesPage;