import React, { Fragment, useState } from "react";
import axios from "../../utils/axios";
import { useSelector } from "react-redux";
import Head from "next/head";

import { API } from "../../config";
import styles from "../../styles/pages/createLink.module.scss";
import ErrorSuccessMsg from "../../components/ErrorSuccessMsg";
import useErrorSuccess from "../../hooks/useErrorSuccess";

const MEDIUM_OPTIONS = ["video", "book", "e-book", "article"];

const INITIAL_FORM_DATA = {
  title: "",
  url: "",
};

const INIITAL_CATEGORIES_DATA = (preCategories) =>
  preCategories.reduce((acc, cur) => {
    acc[[cur._id]] = false;
    return acc;
  }, {});

const INITIAL_MEDIUM_DATA = () =>
  MEDIUM_OPTIONS.reduce((acc, cur, idx) => {
    acc[cur] = idx === 0 ? true : false;
    return acc;
  }, {});

const create = ({ preCategories }) => {
  const user = useSelector(({ user: { user } }) => user);

  // Categories checkbox
  const [categories, setCategories] = useState(
    INIITAL_CATEGORIES_DATA(preCategories)
  );

  // Resource medium radio buttons
  const [medium, setMedium] = useState(INITIAL_MEDIUM_DATA());

  // Is free resource radio buttons
  const [isFree, setIsFree] = useState(true);

  // Right side form
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const { title, url } = formData;

  // Error and success message
  const {
    errorMsg,
    successMsg,
    setErrorMsg,
    setSuccessMsg,
    clearMsg,
  } = useErrorSuccess();

  const handleCategoryChange = (evt) => {
    clearMsg();
    const { id } = evt.target;
    setCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMediumChange = (key) => {
    clearMsg();
    setMedium({
      ...MEDIUM_OPTIONS.reduce((acc, cur) => {
        acc[cur] = false;
        return acc;
      }, {}),
      [key]: true,
    });
  };

  const handleFormChange = (evt) => {
    clearMsg();
    const { name, value } = evt.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    clearMsg();

    const selectedCategories = Object.keys(categories).reduce((acc, cur) => {
      if (categories[cur]) return [...acc, cur];
      return acc;
    }, []);

    const selectedMedium = Object.keys(medium).find((key) => medium[key]);

    if (!selectedCategories.length) {
      return setErrorMsg("At least one category is required.");
    }

    if (!(title && url)) {
      return setErrorMsg("Title and url are required.");
    }

    try {
      const res = await axios.post(`${API}/v1/links`, {
        ...formData,
        categories: selectedCategories,
        medium: selectedMedium,
        isFree,
      });

      console.log(res.data);
      setSuccessMsg("Your resource is successfully shared!");

      // Reset all input fields
      setFormData(INITIAL_FORM_DATA);
      setCategories(INIITAL_CATEGORIES_DATA(preCategories));
      setMedium(INITIAL_MEDIUM_DATA());
      setIsFree(true);
    } catch (error) {
      console.error(error.response);
      setErrorMsg(error.response.data.errors.map((e) => e.msg).join(" "));
    }
  };

  const head = () => (
    <Head>
      <title>TutShare | Share web development study resources</title>
      <meta
        name="description"
        content="TutShare provides the best web development learning resources shared by the devlopers commnunity"
      />
      {/* Open graphs */}
      <meta
        property="og:image"
        content="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2700&q=80"
      />
      <meta
        property="og:title"
        content="TutShare | Web devlopment learning resources"
      />
      <meta
        property="og:description"
        content="TutShare provides the best web development learning resources shared by the devlopers commnunity"
      />
    </Head>
  );

  return (
    <Fragment>
      {head()}
      <div className={styles["_container"]}>
        <div className={styles["_container__left"]}>
          <div className={styles["_container__left__paper"]}>
            <h1 className={styles["_container__left__title"]}>
              Share learning resource
            </h1>
            {/* Categories checkbox */}
            <h4 className={styles["_container__left__label"]}>Categories:</h4>
            <div className={styles["_container__left__input-section"]}>
              {preCategories.map((cate) => (
                <label
                  key={cate._id}
                  className={styles["_container__left__check"]}
                  htmlFor={cate._id}
                >
                  <input
                    type="checkbox"
                    hidden
                    checked={categories[cate._id]}
                    id={cate._id}
                    onChange={handleCategoryChange}
                  />
                  <div className={styles["_container__left__check__icon"]}>
                    {categories[cate._id] ? (
                      <i className="far fa-check-square"></i>
                    ) : (
                      <i className="far fa-square"></i>
                    )}
                  </div>
                  <p className={styles["_container__left__check__name"]}>
                    {cate.name}
                  </p>
                </label>
              ))}
            </div>

            {/* Free or not */}
            <h4 className={styles["_container__left__label"]}>
              Free resource?
            </h4>
            <div className={styles["_container__left__input-section"]}>
              <label
                className={styles["_container__left__check"]}
                htmlFor="free-resource"
              >
                <input
                  type="radio"
                  name="isFree"
                  hidden
                  checked={isFree}
                  onChange={() => {
                    setIsFree(true);
                    clearMsg();
                  }}
                  id="free-resource"
                />
                <div className={styles["_container__left__check__icon"]}>
                  {isFree ? (
                    <i className="fas fa-dot-circle"></i>
                  ) : (
                    <i className="far fa-circle"></i>
                  )}
                </div>
                <p className={styles["_container__left__check__name"]}>Free</p>
              </label>
              <label
                className={styles["_container__left__check"]}
                htmlFor="paid-resource"
              >
                <input
                  type="radio"
                  name="isFree"
                  id="paid-resource"
                  hidden
                  checked={!isFree}
                  onChange={() => {
                    setIsFree(false);
                    clearMsg();
                  }}
                />
                <div className={styles["_container__left__check__icon"]}>
                  {!isFree ? (
                    <i className="fas fa-dot-circle"></i>
                  ) : (
                    <i className="far fa-circle"></i>
                  )}
                </div>
                <p className={styles["_container__left__check__name"]}>Paid</p>
              </label>
            </div>

            {/* The medium of the resource */}
            <h4 className={styles["_container__left__label"]}>
              Resource medium:
            </h4>
            <div className={styles["_container__left__input-section"]}>
              {Object.keys(medium).map((key, idx) => (
                <label
                  key={`${key}-${idx}`}
                  className={styles["_container__left__check"]}
                  htmlFor={`medium-${key}`}
                >
                  <input
                    type="radio"
                    name="medium"
                    id={`medium-${key}`}
                    hidden
                    checked={medium[key]}
                    onChange={() => handleMediumChange(key)}
                  />
                  <div className={styles["_container__left__check__icon"]}>
                    {medium[key] ? (
                      <i className="fas fa-dot-circle"></i>
                    ) : (
                      <i className="far fa-circle"></i>
                    )}
                  </div>
                  <p className={styles["_container__left__check__name"]}>
                    {key}
                  </p>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right side form */}
        <div className={styles["_container__right"]}>
          <div className={styles["_container__right__paper"]}>
            <h1 className={styles["_container__right__title"]}>
              Share learning resource
            </h1>
            <form onSubmit={handleSubmit}>
              <div className={styles["_container__right__form-control"]}>
                <label htmlFor="share-title">Title</label>
                <input
                  type="text"
                  id="share-title"
                  placeholder="Give your resource a title."
                  value={title}
                  onChange={handleFormChange}
                  name="title"
                />
              </div>
              <div className={styles["_container__right__form-control"]}>
                <label htmlFor="share-url">Url</label>
                <input
                  type="text"
                  id="share-url"
                  placeholder="Paste your the url of your resource here."
                  value={url}
                  onChange={handleFormChange}
                  name="url"
                />
              </div>
              <button
                className={styles["_container__right__form-button"]}
                disabled={!user}
              >
                {user ? "Share" : "Please login to share"}
              </button>
            </form>
            <ErrorSuccessMsg successMsg={successMsg} errorMsg={errorMsg} />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default create;

export const getStaticProps = async (ctx) => {
  const res = await axios.get(`${API}/v1/categories`);
  return {
    revalidate: 1,
    props: {
      preCategories: res.data.data.categories,
    },
  };
};
