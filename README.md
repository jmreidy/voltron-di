voltron-di
==========

A dependency injection container for server side apps, built with Angular's ng-di


##API

###indexModule
Create a new module and ingest each file in a provided glob into it

###indexCore
Create a new "Core" module that includes all dependencies, references to Node core module,
and any modules passed into the function
