import fs from "fs";

export default class ProductManager {
  constructor(path) {
    this.path = path;
  }
  //agregar producto

  addProduct = async (product) => {
    try {
      const products = await this.getProducts();
      const {
        title,
        description,
        price,
        thumbnail = [],
        category,
        status = true,
        code,
        stock,
      } = product;
      const codeRepeat = products.find((p) => p.code === product.code);
      if (
        !product.title ||
        !product.description ||
        !product.price ||
        !product.thumbnail ||
        !product.category ||
        !product.status ||
        !product.code ||
        !product.stock
      ) {
        return "Complete all fields";
      }
      if (codeRepeat) {
        return "The insert code already exists";
      }
      let id;
      if (products.length === 0) {
        id = 1;
      } else {
        id = products[products.length - 1].id + 1;
      }

      products.push({ ...product, id });

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(products, null, "\t")
      );
      return product;
    } catch (error) {
      console.log(error);
    }
  };
  getProducts = async () => {
    try {
      if (fs.existsSync(this.path)) {
        const data = await fs.promises.readFile(this.path, "utf-8");
        const parseData = JSON.parse(data);
        return parseData;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  };

  getProductsById = async (id) => {
    try {
      let results = await this.getProducts();
      let product = results.find((p) => p.id === id);

      if (product) {
        return product;
      } else {
        return "Not Found";
      }
    } catch (error) {
      console.log(error);
    }
  };

  updateProduct = async (id, updatedProduct) => {
    try {
      const products = await this.getProducts();
      const indexOfProduct = products.findIndex((p) => p.id === id);
      if (indexOfProduct === -1) {
        return `Can't find product with id : ${id}`;
      }

      products[indexOfProduct] = {
        ...products[indexOfProduct],
        ...updatedProduct,
      };

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(products, null, "\t")
      );
      return products[indexOfProduct];
    } catch (error) {
      console.log(error);
    }
  };

  deleteProduct = async (id) => {
    try {
      const products = await this.getProducts();
      const index = products.findIndex((p) => p.id === id);

      if (index < 0) {
        return `Can't find product with id : ${id}`;
      }
      products.splice(index, 1);

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(products, null, "\t")
      );

      return products;
    } catch (error) {
      console.log(error);
    }
  };
}
