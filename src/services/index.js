import ProductRepository from "./product.services.js";
import CartRepository from "./cart.services.js";
import PersistenceFactory from "../dao/PersistenceFactory.js";
import TicketRepository  from "./ticket.services.js";


const { productsDao, cartsDao, ticketsDao } = await PersistenceFactory.getPersistence();

export const productService = new ProductRepository(new productsDao());
export const cartService = new CartRepository(new cartsDao());
export const ticketService = new TicketRepository(new ticketsDao());