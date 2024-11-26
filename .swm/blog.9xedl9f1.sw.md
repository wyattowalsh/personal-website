---
title: |
  blog
---
<SwmSnippet path="/app/blog/posts/regularized-linear-regression-models-pt1/page.mdx" line="1">

---

&nbsp;

```mdx
---
title: "Basics of Linear Regression Modeling and Ordinary Least Squares (OLS)"
image: "/lasso.webp"
caption: "Model Coefficient Value Changes With Growing Regularization Penalty Values (Image by author)"
summary: "Context of Linear Regression, Optimization to Obtain the OLS Model Estimator, and an Implementation in Python Using Numpy"
tags: ["ML", "TDS", "Python", "Optimization"]
created: "2021-01-13"
---

Hey 👋

Welcome to part one of a three-part deep-dive on **regularized linear regression modeling** — some of the most popular algorithms for supervised learning tasks.

Before hopping into the equations and code, let us first discuss what will be covered in this series.

**Part one** will include an introductory discussion about regression, an explanation of linear regression modeling, and a presentation of the ***Ordinary Least Squares*** (OLS) model (from the derivation of the model estimator using applied optimization theory through the implementation of the findings in Python using NumPy).

Drawbacks of the OLS model and some possible remedies will be discussed in [**part two**](./regularized-linear-regression-models-pt2). One such remedy, ***Ridge Regression***, will be presented here with an explanation including the derivation of its model estimator and NumPy implementation in Python.

[**Part three**](./regularized-linear-regression-models-pt3) will conclude this series of posts with explanations of the remaining regularized linear models: ***the Lasso*** and ***the Elastic Net***. Solving these models is more complicated than in previous cases since a discrete optimization technique is needed. The cause of this complication, the *Pathwise Coordinate Descent* algorithm along with its NumPy-based Python implementation, and some concluding remarks are given in this post.

The models and included implementations were tested on a wine quality prediction dataset of which the code and results can be viewed at the project repository [**here**](https://github.com/wyattowalsh/regularized-linear-regression-deep-dive)

---

## Introduction

Managerial decision making, organizational efficiency, and revenue generation are all areas that can be improved through the utilization of data-based insights. Currently, these insights are being more readily sought out as technological accessibility stretches further and competitive advantages in the market are harder to acquire. One field that seeks to realize value within collected data samples is predictive analytics. By leveraging mathematical/statistical techniques and programming, practitioners are able to identify patterns within data allowing for the generation of valuable insights.

***Regression*** is one technique within predictive analytics that is used to predict the value of a continuous response variable given one or many related feature variables. Algorithms of this class accomplish this task by learning the relationships between the input (feature) variables and the output (response) variable through training on a sample dataset. How these relationships are learned, and furthermore used for prediction varies from algorithm to algorithm. The practitioner is faced with options for regression modeling algorithms, however, linear regression models tend to be explored early on in the process due to their ease of application and high explainability.

---

## Linear Regression Modeling

A linear regression model learns the input-output relationships by fitting a linear function to the sample data. This can be mathematically formalized as:

$$
y_i = \beta_0 + \sum_{j=1}^p \beta_j x_{i,j} + \epsilon_i, \quad \forall i \in \{1, \ldots, n\}\\[1em]
\begin{aligned}
    \textbf{where\:} \\[0.5em]
    p         & : \text{ Number of features}         \\[1em]
    n         & : \text{ Number of samples}          \\[1em]
    \epsilon_i & : \text{ Error term}, \; \epsilon_i \sim \mathcal{N}(0, \sigma^2)
\end{aligned}
$$

Thus, the response is modeled as a weighted sum of the input variables multiplied by linear coefficients with an error term included. It will prove useful in future steps involving optimization to use vector notation. The linear modeling equation can be expressed this way as:

$$
\mathbf{y} = \mathbf{X} \boldsymbol{\beta} + \epsilon\\[1em]
\begin{aligned}
    \textbf{where:} \\[0.5em]
    \mathbf{y} &\in \mathbb{R}^n 
    &: &\text{ Response vector } [y_1, y_2, \ldots, y_n]^\top \\[1em]
    \mathbf{X} &\in \mathbb{R}^{n \times (p+1)} 
    &: &\text{ Design matrix } [\mathbf{1}, \mathbf{X}_1, \mathbf{X}_2, \ldots, \mathbf{X}_p] \\[1em]
    \boldsymbol{\beta} &\in \mathbb{R}^{p+1} 
    &: &\text{ Coefficient vector } [\beta_0, \beta_1, \ldots, \beta_p]^\top \\[1em]
    \boldsymbol{\epsilon} &\in \mathbb{R}^n 
    &: &\text{ Error vector } [\epsilon_1, \epsilon_2, \ldots, \epsilon_n]^\top
\end{aligned}
$$

An important aspect of the above equation to note is that there is a column of **1**’s appended to the design matrix. This is such that the first coefficient of the coefficient vector can serve as an intercept term. In cases where an intercept is not sought after this column can be omitted.

Thus the goal of model training is to find an estimate of the coefficient vector, **β̂**, which can then be utilized with the above equations to make predictions of the response given new feature data. This can be accomplished by applying optimization theory to the model equations above to derive an equation for the model coefficient estimator that minimizes a notion of model error found by training on the sample data.

### Minimizing a Notion of Model Error

To consider how model error can be minimized, a consideration of model error must first be made. Prediction error for a single prediction can be expressed as:

$$
\begin{aligned}
\hat{y}_i &= \sum_{j=1}^p x_{i,j} \hat{\beta}_j \\[0.5em]
\text{residual}_i &= y_i - \hat{y}_i
\end{aligned}
$$

Thus, in vector notation, total model error across all predictions can be found as:

$$
\begin{aligned}
\hat{\mathbf{y}} &= \mathbf{X}\hat{\boldsymbol{\beta}} \\[1em]
\text{Total Error} &= \|\mathbf{y} - \hat{\mathbf{y}}\|_2^2 = (\mathbf{y} - \hat{\mathbf{y}})^\top(\mathbf{y} - \hat{\mathbf{y}})
\end{aligned}
$$

However, for the uses of finding a minimal overall model error, the ***L₂*** norm above is not a good objective function. This is due to the fact that negative errors and positive errors will cancel out, thus a minimization will find an objective value of zero even though in reality the model error is much higher.

This signed error cancellation issue can be solved by squaring the model’s prediction error producing the sum of squared error (SSE) term:

$$
\text{SSE} = \sum_{i=1}^n (y_i - \hat{y}_i)^2 = \sum_{i=1}^n \Big(y_i - \sum_{j=1}^p x_{i,j}\hat{\beta}_j\Big)^2
$$

This same term can be expressed in vector notation as (<a href="#equation-7">Eq. #7</a>):

$$
||y - \hat{y}||_2^2 = ||y - X \hat{\beta}||_2^2
$$

As will be seen in future optimization applications, this function is much better suited to serve as a **loss function**, a function minimized that aptly models the error for a given technique. Many different models other than regularized linear models use the SSE error term as a term in their respective loss functions.

---

## Ordinary Least Squares

Now that linear modeling and error has been covered, we can move on to the most simple linear regression model, ***Ordinary Least Squares*** (OLS). In this case, the simple SSE error term is the model’s loss function and can be expressed as:

$$
L(\beta) = ||y - \hat{y}||_2^2 = ||y - X \hat{\beta}||_2^2
$$

Using this loss function, the problem can now be formalized as a *least-squares* optimization problem. This problem serves to derive estimates for the model parameters, **β**, that minimize the SSE between the actual and predicted values of the outcome and is formalized as:

$$
\hat{\boldsymbol{\beta}}_{\text{OLS}} = \arg \min_{\boldsymbol{\beta}} \Big\{ \frac{1}{2n} \|\mathbf{y} - \mathbf{X}\boldsymbol{\beta}\|_2^2 \Big\}
$$

The 1/(2n) term is added in order to simplify solving the gradient and allow the objective function to converge to the expected value of the model error by **the Law of Large Numbers**.

Aided by the problem’s unconstrained nature, a closed-form solution for the OLS estimator can be obtained by setting the gradient of the loss function (objective) equal to zero and solving the resultant equation for the coefficient vector, **β̂**. This produces the following estimator:

$$
\hat{\boldsymbol{\beta}}_{\text{OLS}} = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}
$$

However, this may not be the only optimal estimator, thus its uniqueness should be proven. To do this, it will suffice to show that the loss function (<a href="#equation-8">Eq. #8</a>) is convex since any local optimality of a convex function is also global optimality and therefore unique.

One possible way to show this is through the second-order convexity conditions, which state that a function is convex if it is continuous, twice differentiable, and has an associated Hessian matrix that is positive semi-definite. Due to its quadratic nature, the OLS loss function (<a href="#equation-8">Eq. #8</a>) is both continuous and twice differentiable, satisfying the first two conditions.

To establish the last condition, the OLS Hessian matrix is found as:

$$
\mathbf{H} = \nabla^2 L(\boldsymbol{\beta}) = \frac{2}{n}\mathbf{X}^\top\mathbf{X}
$$

Furthermore, this Hessian can be shown to be positive semi-definite as:

$$
\begin{aligned}
\mathbf{v}^\top\mathbf{H}\mathbf{v} &= \frac{2}{n}\mathbf{v}^\top(\mathbf{X}^\top\mathbf{X})\mathbf{v} \\[0.5em]
&= \frac{2}{n}(\mathbf{X}\mathbf{v})^\top(\mathbf{X}\mathbf{v}) \\[0.5em]
&= \frac{2}{n}\|\mathbf{X}\mathbf{v}\|_2^2 \geq 0 \quad \forall \mathbf{v} \in \mathbb{R}^{p+1}
\end{aligned}
$$

Thus, by the second-order conditions for convexity, the OLS loss function (<a href="#equation-8">Eq. #8</a>) is convex, thus the estimator found above (<a href="#equation-9">Eq. #9</a>) is the ***unique*** global minimizer to the OLS problem.

### Implementing the Estimator Using Python and NumPy

Solving for the OLS estimator using the matrix inverse does not scale well, thus the NumPy function solve, which employs the LAPACK _gesv routine, is used to find the least-squares solution. This function solves the equation in the case where A is square and full-rank (linearly independent columns). However, in the case that A is not full-rank, then the function lstsq should be used, which utilizes the xGELSD routine and thus finds the singular value decomposition of A.

One possible implementation in Python of OLS with an optional intercept term is:

<Gist url="https://gist.github.com/wyattowalsh/75a3ea1df349c6a3598839d6f042b9e6" />

---

## Conclusion

Hope you enjoyed part one of ***Regularized Linear Regression Models***. 👍

Make sure to check out [**part two**](/blog/regularized-linear-regression-models-pt2) to find out why the OLS model sometimes fails to perform accurately and how ***Ridge Regression*** can be used to help and read [**part three**](/blog/regularized-linear-regression-models-pt3) to learn about two more regularized models, ***the Lasso*** and ***the Elastic Net***.

See [here](https://github.com/wyattowalsh/regularized-linear-regression-deep-dive/blob/master/SOURCES.md) for the different sources utilized to create this series of posts.

Please leave a comment if you would like! I am always trying to improve my posts (logically, syntactically, or otherwise) and am happy to discuss anything related! 😊
```

---

</SwmSnippet>

<SwmSnippet path="/app/blog/posts/regularized-linear-regression-models-pt2/page.mdx" line="1">

---

&nbsp;

```mdx
---
title: "Using Ridge Regression to Overcome Drawbacks of Ordinary Least Squares (OLS)"
image: "/ridge.webp"
caption: "Model Coefficient Value Changes With Growing Regularization Penalty Values (Image by author)"
summary: "Weaknesses of OLS, Optimization to Obtain the Ridge Model Estimator, and an Implementation in Python Using Numpy"
tags: ["ML", "TDS", "Python", "Optimization"]
created: "2021-01-14"
---

Hello again and hopefully welcome back 👋

In [the last part](/blog/regularized-linear-regression-models-pt1) of this three-part deep-dive exploration into **regularized linear regression** modeling techniques, several topics were covered: the equation between the response and feature variables underlying linear regression models, the sum of squared error (SSE) loss function, the ***Ordinary Least Squares*** (OLS) model, and the necessary optimization steps to find an OLS model estimator that can be trained on sample data to produce predictions of a response given new feature data.

Moving forward, in this part, drawbacks of OLS, potential remedies, and the **_Ridge Regression_** model will be discussed.

Similar to the last part, all implementations suggested here were validated on a wine quality prediction dataset that, along with other related files, can be found at the project’s repository, [**here**](http://github.com/wyattowalsh/regularized-linear-regression-deep-dive)**.**

## Drawbacks of OLS

As is with most things, there are tradeoffs that have to made when modeling. One such major tradeoff is that of the **bias-variance tradeoff.** Any model’s error can be broken down into two components: bias and variance. Bias can be considered the error implicit in the modeling algorithm, whereas variance can be considered the error derived from differences in idiosyncrasies across training datasets. A good model is one that should have the overall error minimized, thus both bias and variance should be minimized. However, there is a tradeoff to consider as increasing bias will often decrease variance.

For the OLS model, a high variance is a concern. Since the SSE is being optimized, the model tends to fit outlier data points since they will produce higher error values due to the squared term within the loss function. By fitting these outlier points, the OLS model can subsequently base predictions off modeled patterns that are only present in the training data — idiosyncratic outlying points — and not representative of the entire population. This phenomenon is called **_overfitting_** and can lead to predictive models with low accuracy when generalizing to new predictions.

Since OLS is a low bias model, it is well-suited to have its variance lowered through bias addition, which may result in higher overall predictive ability. One way to add bias is through **shrinkage**, biasing model coefficient estimates toward zero. This shrinkage can be achieved through the addition of a **regularization penalty** to the loss function which applies a unique form of shrinkage to the overall coefficient estimates.

In the next section, I’ll cover **_Ridge Regression_** regularization by the addition of a tuning parameter (λ) coefficient controlled **_L₂_** penalty to the OLS loss function.

> Make sure to check out the next and [final part of the series](/blog/regularized-linear-regression-models-pt3) to learn about the other two forms of regularized linear regression, **the Lasso** and **the Elastic Net.**

---

## Ridge Regression

This form of regression is also known as **_Tikhonov Regularization_** and modifies the OLS loss function ([Part One: Eq. #7](https://towardsdatascience.com/regularized-linear-regression-models-57bbdce90a8c)) with the addition of an **_L₂_** penalty with an associated tuning parameter, **_λ_**. This loss function can be described using vector notation as:

$$
L(\beta) = ||y - X\beta||_2^2 + \lambda||\beta||_2^2  \quad \text{with tuning parameter } \lambda \geq 0
$$

Similarly to the OLS case (<a href="#equation-7">Eq. #7</a>), this loss function can then be formulated as a _least-squares_ optimization problem to find estimates for the model coefficients that minimize the loss function as:

$$
L(\beta) = ||y - X\beta||_2^2 + \lambda||\beta||_2^2  \quad \text{with tuning parameter } \lambda \geq 0
$$

Just like the OLS case, a 1/(2n) term is added in order to simply solving the gradient and allow the objective function to converge to the expected value of the model error by **the Law of Large Numbers**.

This problem is also unconstrained and a closed-form solution for **the Ridge estimator** can be found by setting the gradient of the loss function (objective) equal to zero and solving the resultant equation. This produces an estimator result of:

$$
\hat{\beta} = (X^TX + \lambda I)^{-1}X^Ty
$$

This estimator should also be shown to be unique. In this case, the associated **_Hessian_** matrix is:

$$
H = 2X^TX + 2 \lambda I
$$

It turns out that this matrix can be shown to be **positive definite** by:

$$
\begin{bmatrix}
\hat{\beta}_0 \\
\hat{\beta}
\end{bmatrix} = 
\arg \min_{\beta_0, \beta} 
\left\|
\begin{bmatrix}
Y \\
0
\end{bmatrix} -
\begin{bmatrix}
1_n & X \\
0 & \lambda \cdot I
\end{bmatrix}
\begin{bmatrix}
\beta_0 \\
\beta
\end{bmatrix}
\right\|_2^2
$$

Thus, by utilizing the above data augmentation the same result as [<a href="/blog/posts/regularized-linear-regression-models-pt3#equation-9">Equation #9</a> from the next part of this series] can be used to solve for the coefficient estimates. That result is reproduced here (<a href="#equation-9">Eq. #9</a>):

$$
\hat{\beta} = (X^TX)^{-1}(X^Ty)
$$

### Implementing the Estimator Using Python and NumPy

Similar to the OLS case, the matrix inverse does not scale well, thus the NumPy function `solve`, which employs the LAPACK _\_gesv_ routine, is used to find the least-squares solution. This function solves the equation in the case where A is square and full-rank (linearly independent columns). However, in the case that A is not full-rank, then the function `lstsq` should be used, which utilizes the xGELSD routine and thus finds the singular value decomposition of A.

One possible Python implementation of **_Ridge Regression_** with an optional intercept term is:

<Gist url="https://gist.github.com/wyattowalsh/ea40197ce51b41503bfa188b4ffcecb6" />

---

## Conclusion

Thanks for reading part two of **_Regularized Linear Regression Models_**! 🙌

If you have not already, make sure to check out [**part one**!](/blog/regularized-linear-regression-models-pt1)

Continue on to [**part three**](/blog/regularized-linear-regression-models-pt3) to learn about **_the Lasso_** and **_the Elastic Net_**, the last two regularized linear regression techniques!

See [**here**](https://github.com/wyattowalsh/regularized-linear-regression-deep-dive/blob/master/SOURCES.md) for the different sources utilized to create this series of posts.

Please leave a comment if you would like! I am always trying to improve my posts (logically, syntactically, or otherwise) and am happy to discuss anything related! 👍
```

---

</SwmSnippet>

<SwmSnippet path="/app/blog/posts/regularized-linear-regression-models-pt3/page.mdx" line="1">

---

&nbsp;

```mdx
---
title: "Implementing Pathwise Coordinate Descent For The Lasso and The Elastic Net In Python Using NumPy"
image: "/lasso.webp"
caption: "Model Coefficient Value Changes With Growing Regularization Penalty Values (Image by author)"
summary: "Explanations for Solving Some of the Most Popular Supervised Learning Algorithms"
tags: ["ML", "TDS", "Python", "Optimization"]
created: "2021-01-15"
---

Hey there! 👋

Welcome to the final part of a three-part deep-dive on **regularized linear regression modeling**! In [**part one**](/blog/regularized-linear-regression-models-pt1), linear modeling was established with the derivation of OLS showing how to solve for model coefficients to make predictions of the response given new feature data. Next, in [**part two**](/blog/regularized-linear-regression-models-pt2), **_overfitting_** issues of the OLS model were discussed and **_Ridge Regression_** was presented as a technique to help reduce overfitting through regularization. Building off the same concept as Ridge Regression, **_the Lasso_** and **_the Elastic Net_** are now presented. The series concludes with general considerations of use cases for the techniques presented.

The models and included implementations were tested on a wine quality prediction dataset of which the code and results can be viewed at the project repository [**here**](http://github.com/wyattowalsh/regularized-linear-regression-deep-dive)**.**

---

## The Lasso for Regression

The Lasso, or **_Least Absolute Shrinkage and Selection Operator_**, includes the addition of an **_L₁_** penalty to the OLS loss function (<a href="#equation-7">Equation #7</a>), bringing selective model parameters to zero for a large enough value of an associated tuning parameter, **_λ_**. In other words, **_the Lasso_** **performs automated feature selection** producing a vector of model coefficients with sparsity (amount of elements that are zero) varying on the magnitude of a tuning parameter.

**_The Lasso_** loss function can be formalized as:

$$
L(\beta) = ||y - X \beta||_2^2 + \lambda ||\beta||_1 \text{ with tuning parameter } \lambda \ge 0
$$

Similar to previous cases, an intercept term can be included through data augmentation of the design matrix with a column of **1**s. Furthermore, formulating the problem as a _least-squares_ optimization problem produces:

$$
\hat{\beta} = \arg \min_{\beta} L(\beta) = \arg \min_{\beta} \frac{1}{2n} ||y - X\beta||_2^2 + \lambda ||\beta||_1
$$

However, unlike previous cases, no closed-form solution exists for this problem. This is due to the fact that the addition of the **_L₁_** penalty makes the function no longer continuously differentiable because of the non-smooth absolute component. To remedy this issue, a discrete optimization technique needs to be applied to search for an optimal solution.

Numerous algorithms exist to this end, such as **_LARS_** (Least Angle Regression) and **_Forward Stepwise Regression_**, however, the **_Pathwise Coordinate Descent_** algorithm is leveraged within this work. In short, this algorithm optimizes a parameter at a time holding all other parameters constant.

## Pathwise Coordinate Descent

Before beginning the algorithm, all features should be standardized to have zero mean and variance of one. From there, a **_p+1_** length coefficient vector is initialized to zero. Cycles are then run across all coefficients until convergence — where values of the coefficients stabilize and do not change more than a certain tolerance — is reached. Within each cycle, for every coefficient, an update is calculated and subsequently has the soft-thresholding operator applied to it.

The simplest form of **_Coordinate Descent_ updates** calculates — for each coefficient — the simple (single variable as opposed to multiple regression) least-squares coefficient value using the partial residuals across all other features in the design matrix. Partial residuals, in this case, are found as:

$$
r_{i,j} = y_i - \sum_{k \ne j} x_{i,k} \beta_k
$$

Therefore, the estimate for a particular coefficient value can be found as:

$$
\beta_j^* = \frac{1}{n} \sum_{i=1}^{n} x_{i,j} r_{i,j}
$$

Now, the penalty, as dictated by the tuning parameter, is included in the model through the soft-thresholding operator. This is expressed as:

$$
\beta_j = S(\beta_j^*,\lambda) = \text{sign}(\beta_j^*)(|\beta_j^*| - \lambda)_+ = \begin{cases}
\beta_j^* - \lambda & \beta_j^* > 0 \text{ and } \lambda < |\beta_j^*| \\
\beta_j^* + \lambda & \beta_j^* > 0 \text{ and } \lambda < |\beta_j^*| \\
0 & \lambda \geq |\beta_j^*|
\end{cases}
$$

**_Naive updates_** can be utilized for improved efficiency. These updates are found via:

$$
\beta_j^* = \frac{1}{n} \sum_{i=1}^{n} x_{i,j} r_i + \beta_j
$$

where **_rᵢ_** is the current model residual for all samples, **_n_**.

When the number of samples is much greater than the number of features (**_n_** >> **_p_**), further efficiency improvements can be derived by using **covariance updates**. For these updates, the first term of the naive updates equation above (<a href="#equation-6">Eq. #6</a>) is replaced as shown by:

$$
\sum_{i=1}^{n} x_{i,j} r_i = \langle x_j, y \rangle - \sum_{k: |\beta_k| > 0} \langle x_j, x_k \rangle \beta_k
$$

Utilizing **_warm starts_** can bring efficiency boosts as well. Using **_warm starts_**, a sequence of models are fitted — with tuning parameter values from a max tuning parameter value down to a minimum tuning parameter value that is some small factor (thousandth) of the max value — initializing the coefficients of each iteration to the solution of the last iteration. In many cases, it is actually faster to fit this path of models than a single model for some small **_λ_** value.

$$
\lambda_\text{max} \to \lambda_\text{min} = \epsilon \cdot \lambda_\text{max}
$$

where **_𝜖_** is typically 0.001 and there are 100 values spaced on a log scale.

Furthermore, the max value of the tuning parameter to begin the path at can be found by finding the minimum value that will bring the estimates for all model coefficients to zero. This is since any values above this value will result in total sparsity of the coefficient vector. The max value of the path (starting point) can be found as:

$$
\lambda_{\text{max}} = \frac{\max_l |\langle x_l, y \rangle|}{n}
$$

By providing a starting place to begin searching for optimality, warm starting can many times speed up convergence and also puts the _pathwise_ in the **_Pathwise_** **_Coordinate Descent_** algorithm.

### Implementation of the Lasso In Python Using NumPy

One possible way to implement **_pathwise coordinate descen_**t for **_the Lasso_** (with options for tuning the convergence tolerance, path length, and returning the path) is:

<Gist url="https://gist.github.com/wyattowalsh/6a95b1c9ad6118b196336cffd5de4f72" />

---

## The Elastic Net

In this form of regularized linear regression, the OLS loss function is changed by the addition of both an **_L₁_** and **_L₂_** penalty to the loss function with tuning parameters controlling the intensity of regularization and the balance between the different penalties. This loss function can be formalized as:

$$
L(\beta) = ||y - X \beta||_2^2 + \lambda \left( (1-\alpha) \frac{1}{2} ||\beta||_2^2 + \alpha ||\beta||_1 \right) \text{ with tuning parameters } \lambda \geq 0, 0 \leq \alpha \leq 1
$$

Having both **_L₁_** and **_L₂_** penalties, **_the Elastic Net_** serves to deliver a compromise between Ridge regression and the Lasso, bringing coefficients towards zero and selectively to zero. Here, **_α_** can be considered as the parameter determining the ratio of **_L₁_** penalty to add, whereas **_λ_** can be thought of as the intensity of regularization to apply.

**_The Elastic Net_** loss function is also used to formalize a _least-squares_ optimization problem:

$$
\hat{\beta} = \arg \min_{\beta} L(\beta) = \arg \min_{\beta} \frac{1}{2n} ||y - X\beta||_2^2 + \lambda [(1 - \alpha) \frac{1}{2} ||\beta||_2^2 + \alpha ||\beta||]
$$

Similarly to the Lasso, an intercept is included through design matrix augmentation, a 1/(2n) term is added for mathematical completeness, and **_pathwise coordinate descent_** is implemented to solve since a closed-form solution does not exist due to the **_L₁_** penalty term.

Just as in **_the Lasso, pathwise coordinate descent_** is used to solve for model coefficient estimates however changes need to be made to the update equations to account for the dual penalties. In this case, the **_j_**th coefficient value obtained after soft-thresholding is now found as:

$$
\beta_j = \frac{S(\beta_j^*, \lambda \alpha)}{1 + \lambda (1 - \alpha)}
$$

The soft-thresholding operator is the same operator applied in **_the Lasso_** update (<a href="#equation-5">Eq. #5</a>):

$$
sign(\beta_j^*)(||\beta_j^*|| - \lambda\alpha) + 
$$

Furthermore, **naive updates** or **covariance updates** can be used along with **warm starts**. For **warm starts**, the max **_λ_** value can be calculated as:

$$
\lambda_{max} = \frac{\max_{l} |\langle x_{l}, y \rangle|}{n \alpha}
$$

### Implementation in Python Using NumPy

One possible way to implement **_pathwise coordinate descent_** to solve **_the Elastic Net_** (with options for tuning the convergence tolerance, path length, and returning the path) is:

<Gist url="https://gist.github.com/wyattowalsh/3bfb1a924007f19a7191a17b6c4e52a0" />

---

## Conclusion

Throughout this series, different regularized forms of linear regression have been examined as tools to overcome the tendency to overfit training data of the **_Ordinary Least Squares_** model. **_The Elastic Net_** — due to its balance between regularization varieties — tends to be the most robust to aid the **overfitting** issue, however, **_the Lasso_** certainly can prove helpful in many situations due to its **automated feature selection**. **_Ridge Regression_** is also a good tool to use to ensure a reduction in possible model overfitting as it shrinks model coefficients towards zero, reducing model variance.

The header image of this series well demonstrates the difference between **_Ridge Regression_** and **_the Lasso_**, as it can be seen that the model coefficients all shrink towards zero on the left for the **_Ridge Regression_** case, and, on the right, coefficients are being brought to zero in a selective order for **_the Lasso_** case.

Congratulations! 🎉🎊🥳

You made it to the end of the series!

I hope that these posts were informative and helpful for you to learn more about **_regularized linear regression_** and the necessary **optimization** needed to solve the associated models.

See [**here**](https://github.com/wyattowalsh/regularized-linear-regression-deep-dive/blob/master/SOURCES.md) for the different sources utilized to create this series of posts.

If you are just now beginning the series, make sure to check out [**part one**](/blog/regularized-linear-regression-models-pt1) and [**part two**](/blog/regularized-linear-regression-models-pt2)!

Please leave a comment if you would like! I am always trying to improve my posts (logically, syntactically, or otherwise) and am happy to discuss anything related! 👋
```

---

</SwmSnippet>

<SwmSnippet path="/app/blog/posts/w4w-v6/page.mdx" line="1">

---

&nbsp;

```mdx
---
title: "Personal Web App v6"
image: "/old.webp"
caption: "onelonedatum"
summary: ""
tags: ["Web Dev", "Project", "Typescript", "node.js", "next.js"]
---

```

---

</SwmSnippet>

<SwmSnippet path="/app/blog/posts/layout.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import React, { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";
import { MathProvider } from "@/components/MathContext";

type Props = {
  params: { slug: string }
  children: React.ReactNode
}

const defaultMeta = {
  title: "w4w Blog",
  summary: "Personal blog covering technology, software engineering, and more.",
  date: "2023-01-01",
  tags: ["blog", "technology", "software engineering"],
  image: "/logo.webp"
};

function PostContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function PostsLayout({ children }: Props) {
  return (
    <div className="relative">
      <div className="max-w-7xl lg:max-w-[80rem] xl:max-w-[90rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <MathProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <PostLayout>
              <PostContent>{children}</PostContent>
            </PostLayout>
          </Suspense>
        </MathProvider>
      </div>
    </div>
  );
}
```

---

</SwmSnippet>

<SwmSnippet path="/app/blog/tags/[tag]/page.tsx" line="1">

---

&nbsp;

```tsx
import { getAllPosts, getAllTags } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface TagPageProps {
	params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
	const tags = await getAllTags();
	return tags.map((tag) => ({
		tag: tag,
	}));
}

export async function generateMetadata({
	params,
}: TagPageProps): Promise<Metadata> {
	const { tag } = await params;
	const decodedTag = decodeURIComponent(tag);
	return {
		title: `Posts tagged with #${decodedTag}`,
		description: `Browse all blog posts tagged with #${decodedTag}`,
	};
}

export default async function TagPage({ params }: TagPageProps) {
	const { tag } = await params;
	const decodedTag = decodeURIComponent(tag);
	const posts = await getAllPosts();
	const tags = await getAllTags();

	if (!tags.includes(decodedTag)) {
		notFound();
	}

	const filteredPosts = posts.filter((post) => post.tags?.includes(decodedTag));

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-4">
					Posts tagged with <span className="text-primary">#{decodedTag}</span>
				</h1>
				<p className="text-muted-foreground">
					Found {filteredPosts.length} post
					{filteredPosts.length === 1 ? "" : "s"}
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredPosts.map((post) => (
					<PostCard key={post.slug} post={post} />
				))}
			</div>
		</div>
	);
}

```

---

</SwmSnippet>

<SwmSnippet path="/app/blog/tags/layout.tsx" line="1">

---

&nbsp;

```tsx
import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getAllTags } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard"; // Ensure this is the correct import path
import ParticlesBackground from "@/components/ParticlesBackground";

export default async function TagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tags = await getAllTags();

  return (
    <section className="container mx-auto px-4">
      <ParticlesBackground />
      <div className="py-4">
        <nav className="flex flex-wrap gap-2 mb-4 items-center justify-center">
          {tags.map((tag) => (
            <Link key={tag} href={`/blog/tags/${tag}`}>
              <Badge
                variant="secondary"
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer"
              >
                #{tag}
              </Badge>
            </Link>
          ))}
        </nav>
        <Separator className="my-4" />
      </div>
      {children}
    </section>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/app/blog/tags/page.tsx" line="1">

---

&nbsp;

```tsx
import { getAllPosts, getAllTags } from "@/lib/posts";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Blog Tags",
  description: "Browse blog posts by tag",
};

export default async function TagsIndexPage() {
  const tags = await getAllTags();
  const posts = await getAllPosts();

  // Create a map of tags to post counts
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = posts.filter((post) => post.tags?.includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse by Tag</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tags.map((tag) => (
          <Link key={tag} href={`/blog/tags/${tag}`}>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-lg">
                  #{tag}
                </Badge>
                <span className="text-muted-foreground">
                  {tagCounts[tag]} post{tagCounts[tag] === 1 ? "" : "s"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/app/blog/layout.tsx" line="1">

---

&nbsp;

```tsx
// app/blog/layout.tsx

import React from "react";
import BlogTitle from "@/components/BlogTitle";

export default function BlogRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <BlogTitle />
      <hr className="border-border my-4" />
      <main className="container mx-auto px-4">
        {children}
      </main>
    </div>
  );
}
```

---

</SwmSnippet>

<SwmSnippet path="/app/blog/page.tsx" line="1">

---

&nbsp;

```tsx
// app/blog/page.tsx

import SearchBar from "@/components/SearchBar";
import { getAllTags, getAllPosts } from "@/lib/services";
import ParticlesBackground from "@/components/ParticlesBackground";

export default async function BlogPostsPage() { // Renamed from BlogPage
  const [posts, tags] = await Promise.all([
    getAllPosts(),
    getAllTags()
  ]);

  return (
    <>
      <ParticlesBackground />
      <div className="py-8">
        <SearchBar posts={posts} tags={tags} />
        <div className="grid gap-4 mt-8">
          {posts.map((post) => (
            <article key={post.slug}>
              {/* Post content */}
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBcGVyc29uYWwtd2Vic2l0ZSUzQSUzQXd5YXR0b3dhbHNo" repo-name="personal-website"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
