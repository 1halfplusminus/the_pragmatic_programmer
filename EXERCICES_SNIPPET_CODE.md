
# PRAGMATIC PROGRAMMER

## Assertive Programming

### Use Assertions to prevent the impossible

> Whenever you find yourself thinking "but of course that could never happed." add code to check it.

```c
assert(result != null)
```

```java
assert result != null && result.size() > 0 : "Empty result from XYZ";
```

```c
books = my_sort(find("scifi"))
assert(is_sorted?(books))
```

Don't use assertions in place of real error handling example with IO

Assertions check for things that should never happen.

```c

puts("Enter `Y` or `N`")
ans = gets[0] # Grab first character of response
assert((ch == 'Y') || (ch == 'N')) # Very bad idea!

```

### Assertions and Side Effects

Don't use assertion if the condition has side effects.

```java

while(iter.hasMoreElements()) {
    assert(iter.nextElement() != null); // BAD: iter.nextElement() move the cursor of the iterator
    Object = obj = iter.nextElement();
}

```

### Leave assertions Turned On

### Exercise 16

Which of the "impossible" things can happen ?

- A month with fewer than 28 days -> possible
- Error code from a system call: can't access the current directory -> possible (lock, directory removed, permission error)
  
- In C++: a=2; b = 3; but (a+b) does not equal 5 -> possible
- A triangle with an interior angle sum = 180° -> possible
- A minute that doesn't have 60 seconds -> possible
- (a+1) <= a -> possible

## How to balance resources

> To light a candle is to cast shadow...

We all manage resources whener we code : memory, transactions, threads, network connections , files, timers -- all kinds of things with limited availability.

### Finish What You Start

This tip is easy to apply in most circumstances. It simply means that the function or object that allocates a resource should be responsible for deallocating it.

```ruby
def read_customer
    @customer_file = File.open(@name + ".rec", "r+")
    @balance       = BigDecimal(@customer_file.gets)
end

def write_customer
    @customer_file.rewind
    @customer_file.puts @balance.to_s
    @customer_file.close
end

def update_customer(transaction_amount)
    read_customer
    @balance = @balance.add(transaction_amount, 2)
    write_customer
end
```

Is bad example @customer_file is shared globaly between the two function.

```ruby

def read_customer(file)
    @balance=BigDecimal(file.gets)
end

def write_customer(file)
    file.rewind
    file.puts @balance.to_s
end

def update_customer(transaction_amount)
    file= file.open(@name + ".rec", "r+")
    read_customer(file)
    @balance = @balance.add(transaction_amount,2)
    file.close
end

```

Instead of holding on the file reference, we've changed the code to pass it as parameter. Now all the responsibility
for the file is in the update_customer routine.

Updgrade with enclosed block if language allow it:

```ruby

def update_customer(transaction_amount)
    File.open(@name + ".rec", "r+") do |file|
        read_customer(file)
        @balance = @balance.add(transaction_amount, 2)
        write_customer(file)
    end
end

```

In this case, at the end of the block the file variable goes out of scope.

### Act Locally

#### Balancing Over Timers

For anything that you create that takes up a finite resource, consider how to balance it.

### Nest Allocations

The basic pattern for resource allocation can be extended for routines that need more than one resource at time.

- Deallocate resources in the opposite order to that in which you allocate them. That way you won't orphan resources if
one resource contains references to another.
- When allocating the same set of resources in different places in your code, always allocate them in the same order.
 This will reduce the possibility of deadlock.

### Object and Exception

If you are programming in an object-oriented language, you may fnd it useful to encapsulate reources in classes. Each time you need a particular resource type, you instantiate an object of that class.
When the object goes out of scope, or is reclaimed by the garbage collector, the object
destructor then deallocates the wrapped resource. 

### Balancing and Exceptions

Languages that support exceptions can make resource dealocation tricky.

You generally have two choices:

1. Use variable scope (for example, stack variables in C++ or Rust)
2. Use a finally clause in a try...catch block

### And Exception Antipattern

We commonly see folks writing something like this:

begin
    thing = allocate_resource()
    process(thing)
finally
    deallocate(thing)

What happens if resource allocation fails and raises an exception ?
The finally clause will catch it, and try to deallocate a thing that was never allocated.

The correct pattern for handling resource deallocation in an environment with exceptions is

thing = allocate_resource()
begin 
    process(thing)
finally
    deallocate(thing)
end

### When You Can't Balance Resources

There are times when the basic resource allocation pattern just isn't appropriate. For
Commonly this is found in programs that use dynamic data structures.

One routine will allocate an area of memory and link it into some larger structure, where it may stay for some time.

The trick here is to establish a semantic invariant for memory allocation. You need to decide who is responsible for data
in an aggregate data structure.

What happens when you deallocate the top-level structure ?

You have three main options:

- The top-level structure is also responsible for freeing any substructures that it contains. These structures then recursively delete data they contain, and so on.
- The top-level structure is simply deallocated. Any structures that it pointed to (that are not referenced elsewhere) are orphaned.
- the top-level structure refuses to deallocate itself if it contains any substructures.


The choice here depends on the circumstances of each individual data structure.
Our preference in these circumstances is to write a module for each major structure that provides standard allocation and deallocation facilities for that strcture. (This module can alswo provide facilities such as debug printng, serialization, deserialization and traversal hooks)

### Checking Balance

Because Pragmatic Programmers trust no one, including ourselves, we feel that it is always a good idea to build code that actually checks that resources are indeed freed appropriately. For most applications, this normally means producing wrappers for each type of resource, and using these wrappers to keep track of all allocations and deallocations.

At certain points in your code, the program logic will dictate that the resources will be in a certain state:
use the wrappers to check this.



### Checking thebalance