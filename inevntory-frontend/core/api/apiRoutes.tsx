export const accountRoutes = {
  login: "/user/login",
  signin: "/user/signin",
  updateImage: "/user/update/photo",
  block: "/user/block",
  getMyProfile: "/user/profile",
  getMineProfile: "/user/my/user",
  deleteById: "/user/remove",
  allUsers: '/user/all-users'
}
export const rolesRoutes = {
  getAll: "/roles/all",
}

export const partNumbersRoutes = {
  partImport: "/part/create",
  getAllParts: "/part/all",
  deletePartById: "/part/delete",
  searchByPart : "part/search/all"
}

export const bomRoutes = {
  createBom : "/bom/create",
  getBom : "/bom/get",
  importBom : "/bom/import",
  searchBom : "/bom/search/bom",
  getbomObject : "/bom/whole",
  planBomObject : "/bom/plan/create",
  getAllBom : "/bom/get/all",
  getSubAssemblyDetails : '/bom/child',
  addSubAssembly : '/bom/create/sub',
  getSingleBom : "/bom/single/",
  getPlanning : "/bom/plan/get/transaction",
  getTransaction : "/bom/plan/get/transaction",
  multiInfor: "/bom/plan/multi",
  lockPlanForAll : "/bom/plan/lock/all",
  realsePlanning : "/bom/plan/realse/",
  deleteBomById : "/bom/delete/"
}

export const uomRoutes = {
  getAllUom : "/uom/all"
}

export const analyticsRoutes = {
  getData : "/analytics/getCount",
  getPlanning : "/analytics/getPlanning",
}
