import React, {
  useEffect,
  useRef,
  useState,
  Fragment,
  useImperativeHandle,
  forwardRef
} from "react";
import PropTypes from "prop-types";
import LoaderComponent from "./components/loaderComponent";
import ErrorComponent from "./components/errorComponent";

const pageStates = {
  LOADING: "LOADING",
  ERROR: "ERROR",
  COMPLETED: "COMPLETED"
};

const InitialPageLoader = forwardRef(
  (
    {
      callApiOnMount,
      api,
      successCondition,
      responseParser,

      errorMessage,
      children
    },
    ref
  ) => {
    const [pageState, setPageState] = useState(pageStates.COMPLETED);
    const [data, setData] = useState(null);

    const callApi = () => {
      setPageState(pageStates.LOADING);
      const promise = api();

      promise
        .then(data => {
          const parsedData = responseParser(data);
          setData(parsedData);
          if (successCondition(parsedData)) {
            setPageState(pageStates.COMPLETED);
            return;
          }

          throw parsedData;
        })
        .catch(error => {
          setPageState(pageStates.ERROR);
        });
    };

    useImperativeHandle(ref, () => ({
      callApi
    }));

    useEffect(() => {
      if (callApiOnMount) callApi();
    }, []);
    console.log({ pageState });
    return (
      <Fragment>
        {pageState === pageStates.LOADING && <LoaderComponent />}
        {pageState === pageStates.COMPLETED && children(data)}
        {pageState === pageStates.ERROR && (
          <ErrorComponent
            titleErrorMessage={errorMessage.title}
            errorMessage={errorMessage.message}
            onClickRetry={callApi}
          />
        )}
      </Fragment>
    );
  }
);

InitialPageLoader.defaultProps = {
  callApiOnMount: true,
  successCondition: data => typeof data != "undefined",
  responseParser: data => data,
  errorMessage: {
    title: "Whoops! Something Went Wrong.",
    message: "Please Retry Again."
  }
};

InitialPageLoader.propTypes = {
  children: PropTypes.any.isRequired, //(Mandetory) the children to show after the api call
  api: PropTypes.func.isRequired, //(Mandetory) the promise in which the api call is being made

  callApiOnMount: PropTypes.bool, //(Optional) Don't automatically want to call the api on mount, instead
  successCondition: PropTypes.func, //(Optional) Handles the custom success condition
  responseParser: PropTypes.func, //(Optional) Parsers custom data from api

  errorMessage: PropTypes.object
};

export default InitialPageLoader;
