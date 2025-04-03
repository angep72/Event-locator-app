const { createCategory, getCategoryEvents } = require('../controllers/category.controller');


const client = require('../connection');

// Mock the client module
jest.mock('../connection', () => ({
  query: jest.fn(),
}));

describe('Category Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup request and response objects
    req = {
      body: {},
      params: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createCategory', () => {
    it('should return 400 if category_name is not provided', () => {
      // Act
      createCategory(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Category name is required.'
      });
      expect(client.query).not.toHaveBeenCalled();
    });

    it('should create a category and return 201 with category data', () => {
      // Arrange
      const mockCategory = { id: 1, category_name: 'Music' };
      req.body = { category_name: 'Music' };
      
      client.query.mockImplementation((query, values, callback) => {
        callback(null, { rows: [mockCategory] });
      });
      
      // Act
      createCategory(req, res);
      
      // Assert
      expect(client.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO event_categories'),
        ['Music'],
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCategory
      });
    });

    it('should return 500 if database query fails', () => {
      // Arrange
      const mockError = new Error('Database connection error');
      req.body = { category_name: 'Music' };
      
      client.query.mockImplementation((query, values, callback) => {
        callback(mockError, null);
      });
      
      // Act
      createCategory(req, res);
      
      // Assert
      expect(client.query).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database connection error'
      });
    });
  });

  describe('getCategoryEvents', () => {
    it('should return all categories', () => {
      // Arrange
      const mockCategories = [
        { id: 1, category_name: 'Music' },
        { id: 2, category_name: 'Sports' }
      ];
      
      client.query.mockImplementation((query, callback) => {
        callback(null, { rows: mockCategories });
      });
      
      // Act
      getCategoryEvents(req, res);
      
      // Assert
      expect(client.query).toHaveBeenCalledWith(
        'SELECT * FROM event_categories',
        expect.any(Function)
      );
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCategories
      });
    });

    it('should return 500 if database query fails', () => {
      // Arrange
      const mockError = new Error('Database connection error');
      
      client.query.mockImplementation((query, callback) => {
        callback(mockError, null);
      });
      
      // Act
      getCategoryEvents(req, res);
      
      // Assert
      expect(client.query).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database connection error'
      });
    });
  });
});