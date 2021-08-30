import React, { useState, useEffect, useContext } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

export const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [requests, setRequests] = useState(0);
  const [isloading, setIsLoading] = useState(false);
  // error
  const [error, setError] = useState({ show: false, msg: "" });

  // fetch github user
  const searchGithubUser = async (user) => {
    // toggle error
    toggleError();
    // set loading(true)
    setIsLoading(true);
    const response = await axios
      .get(`${rootUrl}/users/${user}`)
      .catch((err) => {
        console.log(err);
      });

    if (response) {
      setGithubUser(response.data);
      const { repos_url, followers_url } = response.data;
      // fetch repos
      axios(`${repos_url}?per_page=100`)
        .then((response) => {
          setRepos(response.data);
        })
        .catch((err) => {
          console.log(err);
        });

      // fetch followers
      axios(`${followers_url}?per_page=100`)
        .then((response) => {
          setFollowers(response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      toggleError(true, "there is no user with that username");
    }
    checkNumOfRequests();
    setIsLoading(false);
  };

  const checkNumOfRequests = () => {
    axios
      .get(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;
        setRequests(remaining);
        if (remaining === 0) {
          toggleError(true, "sorry you have exceeded your hourly rate limit!");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(checkNumOfRequests, []);

  const toggleError = (show = false, msg = "") => {
    console.log(show, msg);
    setError({ show, msg });
  };
  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        isloading,
        searchGithubUser,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export const useGithubContext = () => {
  return useContext(GithubContext);
};
