import React, { Component } from "react"
import { Button, ButtonGroup, Container, Table } from 'reactstrap';
import logo from './logo.svg';
import './App.css';
import './frameStyle.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      products: [],
      itemClass: {},
      modelFile: "",
      selected: ""
    };

    this.clothClickHandler = this.clothClickHandler.bind(this);
    this.getNewButtonHandler = this.getNewButtonHandler.bind(this);
    this.generateAllProducts = this.generateAllProducts.bind(this);
    this.fetchNewModelWithProducts = this.fetchNewModelWithProducts.bind(this);
    this.fetchNewModelWithSelectedProduct = this.fetchNewModelWithSelectedProduct.bind(this);
    this.fetchNewTryonModelImage = this.fetchNewTryonModelImage.bind(this);
  }

  async componentDidMount() {
    this.fetchNewModelWithProducts();
  };

  fetchNewModelWithProducts() {
    fetch('http://3.137.127.110:4000/get_model_metadata', {
      method: "GET"
    }).then(response => response.json()).then((body) => {
      let modelFile = body.model_file;
      let allProducts = this.generateAllProducts(body);
      let itemClasses = {};
      allProducts.forEach((item, i) => {
        itemClasses[item] = "productImgContainer";
      });
      this.setState({isLoading: false, products: allProducts, itemClass: itemClasses, modelFile: modelFile, selected: ""});
    });
  }

  fetchNewModelWithSelectedProduct() {
    fetch('http://3.137.127.110:4000/generate_model_and_product?product_id=' + this.state.selected)
    .then(response => response.json())
    .then(body => {
      let newModelFile = body.new_model_file;
      this.setState({modelFile: newModelFile});
    })
    .then(() => {
      fetch('http://3.137.127.110:4000/get_model_metadata?model_file=' + this.state.modelFile)
      .then(response => response.json())
      .then(body => {
        let modelFile = body.model_file;
        let allProducts = this.generateAllProducts(body);
        let itemClasses = {};
        allProducts.forEach((item, i) => {
          itemClasses[item] = "productImgContainer";
        });

        this.setState({isLoading: false, products: allProducts, itemClass: itemClasses, modelFile: modelFile, selected: ''});
      })
    });
  }

  fetchNewTryonModelImage(itemName, modelFile) {
    fetch('http://3.137.127.110:4000/generate_model_and_product?model_file=' + modelFile + '&product_id=' + itemName)
    .then(response => response.json())
    .then(body => {
      let newModelFile = body.new_model_file;
      this.setState({modelFile: newModelFile});
      this.setState({selected: itemName})
    });
  }

  generateAllProducts(body) {
      let tops = typeof(body.recommendation_dict.tops) == 'undefined' ? [] : body.recommendation_dict.tops;
      let bots = typeof(body.recommendation_dict.bottoms) == 'undefined' ? [] : body.recommendation_dict.bottoms;
      let outs = typeof(body.recommendation_dict.outerwear) == 'undefined' ? [] : body.recommendation_dict.outerwear;
      let allBody = typeof(body.recommendation_dict.allbody) == 'undefined' ? [] : body.recommendation_dict.allbody
      let allProducts = tops.concat(bots).concat(outs).concat(allBody);
      return allProducts;
  }

  clothClickHandler(e) {
    let itemName = e.target.name;
    let modelFile = this.state.modelFile;
    this.fetchNewTryonModelImage(itemName, modelFile);
  }

  getNewButtonHandler(e) {
    if(typeof(this.state.selected) == 'undefined' || this.state.selected == "") {
      this.fetchNewModelWithProducts();
    } else {
      this.fetchNewModelWithSelectedProduct();
    }
  }

  render() {
    const {isLoading, products, itemClass, modelFile} = this.state;
    if(isLoading) {
      return <p>Loading</p>
    }

    return (
      <div className="frame">
        <div className="modelFrame">
          <img className="modelImg" src={"http://3.137.127.110:4000/get_image?model_file=" + modelFile} />
        </div>
        <div className="clothFrame">
          <div className="clothOptions">
            {
              products.map((product) => (
                <div className={itemClass[product]} onClick={this.clothClickHandler} >
                  <img name={product} className="productImg" src={"https://virtual-tryon-training-data.s3.us-east-2.amazonaws.com/farfetch_images/"+ product + "/in.jpg"} />
                </div>
              ))
            }
          </div>
          <div className="newButton">
            <Button className="getNewModelButton" onClick={this.getNewButtonHandler}>Try Another Model</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
